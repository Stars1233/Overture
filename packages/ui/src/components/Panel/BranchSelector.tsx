import { Branch } from '@/stores/plan-store';
import { Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId?: string;
  onSelect: (branchId: string) => void;
}

export function BranchSelector({
  branches,
  selectedBranchId,
  onSelect,
}: BranchSelectorProps) {
  console.log('[BranchSelector] Rendering with branches:', branches.length, branches.map(b => b.label));
  console.log('[BranchSelector] Selected branch ID:', selectedBranchId);

  if (branches.length === 0) {
    console.log('[BranchSelector] WARNING: No branches to display!');
    return <div className="text-xs text-text-muted">No branch options available</div>;
  }

  return (
    <div className="space-y-3">
      {branches.map((branch, index) => {
        const isSelected = selectedBranchId === branch.id;

        return (
          <motion.button
            key={branch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(branch.id)}
            className={clsx(
              'w-full text-left p-4 rounded-xl border-2 transition-all duration-200',
              {
                'border-accent-green bg-accent-green/10 shadow-glow-green': isSelected,
                'border-border hover:border-border-subtle bg-surface-raised': !isSelected,
              }
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-text-primary">
                {branch.label}
              </h4>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-accent-green flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>

            {/* Description */}
            {branch.description && (
              <p className="text-xs text-text-muted mb-3">{branch.description}</p>
            )}

            {/* Pros and Cons */}
            {(branch.pros || branch.cons) && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                {branch.pros && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsUp className="w-3 h-3 text-accent-green" />
                      <span className="text-[10px] text-accent-green font-medium uppercase">
                        Pros
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {branch.pros}
                    </p>
                  </div>
                )}
                {branch.cons && (
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ThumbsDown className="w-3 h-3 text-accent-red" />
                      <span className="text-[10px] text-accent-red font-medium uppercase">
                        Cons
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {branch.cons}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
