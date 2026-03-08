import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Minus, Plus } from 'lucide-react';
import {
  useSettingsStore,
  MIN_NODES_MIN,
  MIN_NODES_MAX,
} from '@/stores/settings-store';
import { useWebSocket } from '@/hooks/useWebSocket';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { minNodesPerPlan, setMinNodesPerPlan } = useSettingsStore();
  const { syncSettings } = useWebSocket();

  // Local state for editing (so we can cancel changes)
  const [localMinNodes, setLocalMinNodes] = useState(minNodesPerPlan);

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalMinNodes(minNodesPerPlan);
    }
  }, [isOpen, minNodesPerPlan]);

  const handleSave = () => {
    setMinNodesPerPlan(localMinNodes);
    syncSettings();
    onClose();
  };

  const handleCancel = () => {
    setLocalMinNodes(minNodesPerPlan);
    onClose();
  };

  const handleIncrement = () => {
    if (localMinNodes < MIN_NODES_MAX) {
      setLocalMinNodes(localMinNodes + 1);
    }
  };

  const handleDecrement = () => {
    if (localMinNodes > MIN_NODES_MIN) {
      setLocalMinNodes(localMinNodes - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      // Clamp to valid range
      const clampedValue = Math.min(Math.max(value, MIN_NODES_MIN), MIN_NODES_MAX);
      setLocalMinNodes(clampedValue);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-lg shadow-accent-purple/20">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Settings</h2>
              </div>
              <button
                onClick={handleCancel}
                className="w-9 h-9 rounded-xl bg-surface-raised hover:bg-surface-overlay flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </header>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Min Nodes Setting */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <label
                      htmlFor="min-nodes"
                      className="text-sm font-semibold text-text-primary"
                    >
                      Minimum Nodes Per Plan
                    </label>
                    <p className="text-xs text-text-muted mt-1">
                      Plans with fewer nodes than this will be rejected.
                      Valid range: {MIN_NODES_MIN}-{MIN_NODES_MAX}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Decrement button */}
                  <button
                    onClick={handleDecrement}
                    disabled={localMinNodes <= MIN_NODES_MIN}
                    className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-surface-overlay
                             flex items-center justify-center transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4 text-text-secondary" />
                  </button>

                  {/* Number input */}
                  <input
                    id="min-nodes"
                    type="number"
                    min={MIN_NODES_MIN}
                    max={MIN_NODES_MAX}
                    value={localMinNodes}
                    onChange={handleInputChange}
                    className="flex-1 h-10 px-4 bg-canvas border border-border rounded-xl
                             text-center text-lg font-semibold text-text-primary
                             focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
                             transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Increment button */}
                  <button
                    onClick={handleIncrement}
                    disabled={localMinNodes >= MIN_NODES_MAX}
                    className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-surface-overlay
                             flex items-center justify-center transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-border bg-surface/50 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 text-sm font-medium text-text-secondary
                         hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue
                         text-white text-sm font-semibold rounded-xl
                         hover:shadow-lg hover:shadow-accent-purple/25 hover:-translate-y-0.5
                         transition-all"
              >
                Save Changes
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
