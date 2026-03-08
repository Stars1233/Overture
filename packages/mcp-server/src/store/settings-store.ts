/**
 * Server-side settings store
 * Settings are received from the UI via WebSocket
 */

// Settings state
interface Settings {
  minNodesPerPlan: number;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  minNodesPerPlan: 1,
};

// Constants
export const MIN_NODES_MIN = 1;
export const MIN_NODES_MAX = 20;

/**
 * Settings store singleton
 */
class SettingsStore {
  private settings: Settings = { ...DEFAULT_SETTINGS };

  /**
   * Get current settings
   */
  getSettings(): Settings {
    return { ...this.settings };
  }

  /**
   * Get minimum nodes per plan setting
   */
  getMinNodesPerPlan(): number {
    return this.settings.minNodesPerPlan;
  }

  /**
   * Update settings from UI
   */
  updateSettings(newSettings: Partial<Settings>): void {
    if (newSettings.minNodesPerPlan !== undefined) {
      // Clamp to valid range
      const value = Math.min(
        Math.max(newSettings.minNodesPerPlan, MIN_NODES_MIN),
        MIN_NODES_MAX
      );
      this.settings.minNodesPerPlan = value;
      console.error(`[Overture] Settings updated: minNodesPerPlan = ${value}`);
    }
  }

  /**
   * Reset settings to defaults
   */
  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    console.error('[Overture] Settings reset to defaults');
  }
}

// Export singleton instance
export const settingsStore = new SettingsStore();
