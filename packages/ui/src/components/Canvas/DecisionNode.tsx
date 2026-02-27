import { memo, useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { PlanNode, Branch } from '@/stores/plan-store';
import { GitBranch, Check, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface DecisionNodeData extends PlanNode {
  isDisabledBranch?: boolean;
  isUnexecuted?: boolean;
  isExecuting?: boolean;
  isCompleted?: boolean;
  canModify?: boolean;
  canInsertAfter?: boolean;
  canRemove?: boolean;
  onInsertNode?: (afterNodeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
}

interface DecisionNodeProps {
  data: DecisionNodeData;
  selected?: boolean;
}

export const DecisionNode = memo(function DecisionNode({ data, selected }: DecisionNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDisabled = data.isDisabledBranch;
  const isUnexecuted = data.isUnexecuted;
  const isActive = data.status === 'active' && !isDisabled;
  const canModify = data.canModify && !isDisabled;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: isDisabled ? 0.35 : isUnexecuted ? 0.5 : 1,
        scale: isDisabled ? 0.95 : 1,
        y: 0,
        filter: isDisabled ? 'grayscale(0.8)' : isUnexecuted ? 'grayscale(0.5)' : 'grayscale(0)',
        boxShadow: isActive
          ? [
              '0 0 0 0 rgba(234, 179, 8, 0.4), 0 0 20px 5px rgba(234, 179, 8, 0.3)',
              '0 0 0 0 rgba(234, 179, 8, 0.7), 0 0 30px 10px rgba(234, 179, 8, 0.5)',
              '0 0 0 0 rgba(234, 179, 8, 0.4), 0 0 20px 5px rgba(234, 179, 8, 0.3)',
            ]
          : '0 0 0 0 rgba(0, 0, 0, 0)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        boxShadow: isActive
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 },
      }}
      onMouseEnter={() => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
        }, 300);
      }}
      className={clsx(
        'px-4 py-3 rounded-xl min-w-[240px] max-w-[320px] relative overflow-visible',
        'bg-gradient-to-br from-accent-purple/10 to-accent-blue/10',
        'backdrop-blur-sm',
        'border-2 transition-colors duration-200',
        {
          'border-accent-purple/30 hover:border-accent-purple/50': !selected && !isActive && !isDisabled,
          'border-status-active': isActive,
          'border-status-completed': data.status === 'completed' && !isDisabled,
          'ring-2 ring-accent-purple ring-offset-2 ring-offset-canvas': selected && !isDisabled,
          'border-border/50': isUnexecuted,
          'pointer-events-none': isDisabled,
        }
      )}
    >
      {/* Remove button - right side of top edge */}
      {isHovered && canModify && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onRemoveNode?.(data.id);
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setIsHovered(false);
            }, 300);
          }}
          className="absolute -top-5 left-[calc(50%+16px)] z-50 text-white/60 hover:text-white hover:scale-110 transition-all"
          title="Remove node"
        >
          <Minus className="w-5 h-5" />
        </button>
      )}

      {/* Insert button - right side of bottom edge */}
      {isHovered && canModify && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onInsertNode?.(data.id);
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setIsHovered(false);
            }, 300);
          }}
          className="absolute -bottom-8 left-[calc(50%+16px)] z-50 text-white/60 hover:text-white hover:scale-110 transition-all"
          title="Insert node after"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-accent-purple !border-2 !border-surface"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={clsx(
          'p-1.5 rounded-lg',
          isActive ? 'bg-status-active/20' : 'bg-accent-purple/20'
        )}>
          {isActive ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <GitBranch className="w-4 h-4 text-status-active" />
            </motion.div>
          ) : (
            <GitBranch className={clsx('w-4 h-4', data.status === 'completed' ? 'text-status-completed' : 'text-accent-purple')} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm text-text-primary">
            {data.title}
          </h3>
          <p className="text-[10px] text-text-muted">Choose a path</p>
        </div>

      </div>

      {/* Branches */}
      {data.branches && (
        <div className="space-y-2">
          {data.branches.map((branch: Branch) => (
            <div
              key={branch.id}
              className={clsx(
                'px-3 py-2 rounded-lg border transition-all cursor-pointer',
                {
                  'border-accent-green bg-accent-green/10':
                    data.selectedBranchId === branch.id,
                  'border-border hover:border-border-subtle bg-surface/50':
                    data.selectedBranchId !== branch.id,
                }
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary">
                  {branch.label}
                </span>
                {data.selectedBranchId === branch.id && (
                  <Check className="w-3 h-3 text-accent-green" />
                )}
              </div>
              {branch.description && (
                <p className="text-[10px] text-text-muted mt-1 line-clamp-2">
                  {branch.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status indicator */}
      {!data.selectedBranchId && data.branches && data.branches.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <span className="text-[10px] text-accent-yellow">
            Selection required
          </span>
        </div>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-accent-purple !border-2 !border-surface"
      />
    </motion.div>
  );
});
