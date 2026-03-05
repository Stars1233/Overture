import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Settings state for Overture UI
 */
interface SettingsState {
  // Minimum number of nodes required per plan (1-20)
  minNodesPerPlan: number;

  // Actions
  setMinNodesPerPlan: (value: number) => void;
}

// Constants
export const MIN_NODES_MIN = 1;
export const MIN_NODES_MAX = 20;
export const MIN_NODES_DEFAULT = 1;

/**
 * Settings store with localStorage persistence
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      minNodesPerPlan: MIN_NODES_DEFAULT,

      // Actions
      setMinNodesPerPlan: (value: number) => {
        // Clamp value to valid range
        const clampedValue = Math.min(Math.max(value, MIN_NODES_MIN), MIN_NODES_MAX);
        set({ minNodesPerPlan: clampedValue });
      },
    }),
    {
      name: 'overture-settings',
      // Only persist specific keys
      partialize: (state) => ({
        minNodesPerPlan: state.minNodesPerPlan,
      }),
    }
  )
);
