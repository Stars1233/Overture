import fs from 'fs/promises';
import path from 'path';
import { PersistedPlan, HistoryEntry } from '../types.js';

/**
 * Maximum number of plans to keep in project history
 */
const MAX_PROJECT_HISTORY_ENTRIES = 50;

/**
 * Project configuration stored in .overture.json
 */
export interface ProjectConfig {
  version: 1;
  projectId: string;
  history: PersistedPlan[];
  settings?: {
    minNodesPerPlan?: number;
    defaultModel?: string;
    defaultProvider?: string;
  };
}

/**
 * Manages per-project storage in .overture.json within each project folder.
 * Falls back to global storage (~/.overture/) if write permission is denied.
 */
export class ProjectStorage {
  private workspacePath: string;
  private filePath: string;
  private projectId: string;
  private cache: ProjectConfig | null = null;
  private writeDebounceTimer: NodeJS.Timeout | null = null;
  private writePromise: Promise<void> | null = null;
  private writePermissionDenied: boolean = false;

  constructor(workspacePath: string, projectId: string) {
    this.workspacePath = workspacePath;
    this.projectId = projectId;
    this.filePath = path.join(workspacePath, '.overture.json');
  }

  /**
   * Get the storage file path
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Check if write permission was denied (should fall back to global storage)
   */
  isWritePermissionDenied(): boolean {
    return this.writePermissionDenied;
  }

  /**
   * Check if project storage file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load project configuration from disk (with caching)
   */
  async load(): Promise<ProjectConfig> {
    if (this.cache) return this.cache;

    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);

      // Validate structure
      if (!parsed || typeof parsed.version !== 'number') {
        console.error('[Overture] Invalid project config format, creating new one');
        this.cache = this.createEmptyConfig();
        return this.cache;
      }

      this.cache = parsed as ProjectConfig;
      console.error(`[Overture] Loaded project config: ${this.cache.history.length} history entries`);
      return this.cache;
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        // File doesn't exist, create empty config
        console.error('[Overture] Project config does not exist, creating new one');
        this.cache = this.createEmptyConfig();
        return this.cache;
      }

      if (nodeError.code === 'EACCES') {
        // Permission denied - mark for fallback to global storage
        console.error('[Overture] Permission denied reading project config, will use global storage');
        this.writePermissionDenied = true;
        this.cache = this.createEmptyConfig();
        return this.cache;
      }

      // For other errors, log but create empty cache
      console.error('[Overture] Error loading project config:', nodeError.message || String(error));
      this.cache = this.createEmptyConfig();
      return this.cache;
    }
  }

  /**
   * Create an empty project configuration
   */
  private createEmptyConfig(): ProjectConfig {
    return {
      version: 1,
      projectId: this.projectId,
      history: [],
    };
  }

  /**
   * Save project configuration to disk (debounced)
   */
  async save(): Promise<void> {
    if (this.writePermissionDenied) {
      console.error('[Overture] Write permission denied, skipping project storage save');
      return;
    }

    // Clear any existing debounce timer
    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
    }

    // Return existing write promise if one is pending
    if (this.writePromise) {
      return this.writePromise;
    }

    this.writePromise = new Promise((resolve, reject) => {
      this.writeDebounceTimer = setTimeout(async () => {
        try {
          if (!this.cache) {
            resolve();
            return;
          }

          await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2));
          console.error('[Overture] Project config saved to', this.filePath);
          resolve();
        } catch (error: unknown) {
          const nodeError = error as NodeJS.ErrnoException;
          if (nodeError.code === 'EACCES') {
            console.error('[Overture] Permission denied writing project config, will use global storage');
            this.writePermissionDenied = true;
            resolve(); // Don't reject - caller should fall back to global storage
          } else {
            console.error('[Overture] Failed to save project config:', error);
            reject(error);
          }
        } finally {
          this.writePromise = null;
        }
      }, 1000); // Write at most once per second
    });

    return this.writePromise;
  }

  /**
   * Force immediate save (bypass debounce)
   */
  async saveNow(): Promise<void> {
    if (this.writePermissionDenied) {
      console.error('[Overture] Write permission denied, skipping project storage save');
      return;
    }

    if (this.writeDebounceTimer) {
      clearTimeout(this.writeDebounceTimer);
      this.writeDebounceTimer = null;
    }

    if (!this.cache) return;

    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2));
      console.error('[Overture] Project config saved (immediate) to', this.filePath);
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'EACCES') {
        console.error('[Overture] Permission denied writing project config');
        this.writePermissionDenied = true;
      } else {
        console.error('[Overture] Failed to save project config:', error);
        throw error;
      }
    }
  }

  /**
   * Add or update a plan in history
   */
  async addPlanToHistory(plan: PersistedPlan): Promise<void> {
    const config = await this.load();

    // Update or add plan
    const existingIndex = config.history.findIndex(p => p.plan.id === plan.plan.id);
    if (existingIndex >= 0) {
      config.history[existingIndex] = plan;
    } else {
      config.history.unshift(plan); // Add to front (most recent)
    }

    // Prune old entries if over limit
    if (config.history.length > MAX_PROJECT_HISTORY_ENTRIES) {
      const removed = config.history.splice(MAX_PROJECT_HISTORY_ENTRIES);
      console.error(`[Overture] Pruned ${removed.length} old project history entries`);
    }

    await this.save();
  }

  /**
   * Get all history entries for this project
   */
  async getHistory(): Promise<PersistedPlan[]> {
    const config = await this.load();
    return config.history;
  }

  /**
   * Get history entries as lightweight HistoryEntry objects
   */
  async getHistoryEntries(): Promise<HistoryEntry[]> {
    const config = await this.load();
    return config.history.map(persisted => ({
      id: persisted.plan.id,
      projectId: persisted.plan.projectId,
      workspacePath: persisted.plan.workspacePath,
      projectName: path.basename(persisted.plan.workspacePath),
      title: persisted.plan.title,
      agent: persisted.plan.agent,
      status: persisted.plan.status,
      createdAt: persisted.plan.createdAt,
      updatedAt: new Date().toISOString(), // We don't store updatedAt per plan, so use now
      nodeCount: persisted.nodes.length,
      completedNodeCount: persisted.nodes.filter(n => n.status === 'completed').length,
    }));
  }

  /**
   * Get a specific plan by ID
   */
  async getPlan(planId: string): Promise<PersistedPlan | null> {
    const config = await this.load();
    return config.history.find(p => p.plan.id === planId) || null;
  }

  /**
   * Delete a plan from history
   */
  async deletePlan(planId: string): Promise<void> {
    const config = await this.load();
    config.history = config.history.filter(p => p.plan.id !== planId);
    await this.save();
  }

  /**
   * Get project settings
   */
  async getSettings(): Promise<ProjectConfig['settings']> {
    const config = await this.load();
    return config.settings;
  }

  /**
   * Update project settings
   */
  async updateSettings(settings: Partial<NonNullable<ProjectConfig['settings']>>): Promise<void> {
    const config = await this.load();
    config.settings = {
      ...config.settings,
      ...settings,
    };
    await this.save();
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    const config = await this.load();
    config.history = [];
    await this.saveNow();
  }

  /**
   * Invalidate cache (force reload from disk on next access)
   */
  invalidateCache(): void {
    this.cache = null;
  }
}

/**
 * Registry of active project storage instances
 */
class ProjectStorageRegistry {
  private storages: Map<string, ProjectStorage> = new Map();

  /**
   * Get or create a ProjectStorage instance for a workspace path
   */
  getStorage(workspacePath: string, projectId: string): ProjectStorage {
    // Use workspace path as key since projectId is derived from it
    const key = workspacePath;

    let storage = this.storages.get(key);
    if (!storage) {
      storage = new ProjectStorage(workspacePath, projectId);
      this.storages.set(key, storage);
      console.error(`[Overture] Created project storage for: ${workspacePath}`);
    }

    return storage;
  }

  /**
   * Check if a project has local storage
   */
  hasStorage(workspacePath: string): boolean {
    return this.storages.has(workspacePath);
  }

  /**
   * Remove storage instance from registry
   */
  removeStorage(workspacePath: string): void {
    this.storages.delete(workspacePath);
  }

  /**
   * Get all active storage instances
   */
  getAllStorages(): ProjectStorage[] {
    return Array.from(this.storages.values());
  }

  /**
   * Clear all storage instances
   */
  clear(): void {
    this.storages.clear();
  }
}

// Singleton registry
export const projectStorageRegistry = new ProjectStorageRegistry();
