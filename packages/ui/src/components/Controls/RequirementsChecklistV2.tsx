import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  GitBranch,
  ChevronDown,
  ChevronRight,
  FormInput,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { usePlanStore, PlanNode, DynamicField } from '@/stores/plan-store';
import { useMultiProjectStore } from '@/stores/multi-project-store';
import { BranchSelectionModal } from '../Modals/BranchSelectionModal';
import { clsx } from 'clsx';

interface NodeRequirement {
  node: PlanNode;
  planId: string;
  fields: DynamicField[];
  isBranchPoint: boolean;
  branchOptions: Array<{
    id: string;
    title: string;
    description: string;
    pros?: string;
    cons?: string;
  }>;
  isComplete: boolean;
  requiredFieldsComplete: boolean;
  branchSelected: boolean;
}

export function RequirementsChecklistV2() {
  const { plans, setSelectedNodeId, selectedNodeId, updateFieldValue, setSelectedBranch } = usePlanStore();
  const { activeTabId, setProjectFieldValue, setProjectSelectedBranch } = useMultiProjectStore();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [activeBranchNode, setActiveBranchNode] = useState<NodeRequirement | null>(null);

  // Find the most recent plan that's in 'ready' status (only show for ready plans)
  const readyPlan = [...plans].reverse().find(p => p.plan.status === 'ready');

  if (!readyPlan) {
    return null;
  }

  const { plan, nodes, edges } = readyPlan;

  // Filter out explicit decision nodes (legacy)
  const decisionNodeIds = new Set(nodes.filter(n => n.type === 'decision').map(n => n.id));
  const visibleNodes = nodes.filter(n => n.type !== 'decision');

  // Build outgoing edges map
  const outgoingEdgesMap: Record<string, string[]> = {};
  for (const edge of edges) {
    if (decisionNodeIds.has(edge.from) || decisionNodeIds.has(edge.to)) continue;
    if (!outgoingEdgesMap[edge.from]) {
      outgoingEdgesMap[edge.from] = [];
    }
    if (!outgoingEdgesMap[edge.from].includes(edge.to)) {
      outgoingEdgesMap[edge.from].push(edge.to);
    }
  }

  // Find disabled nodes (unselected branch siblings)
  const disabledNodeIds = new Set<string>();
  for (const [branchPointId, targets] of Object.entries(outgoingEdgesMap)) {
    if (targets.length > 1) {
      const branchNode = visibleNodes.find(n => n.id === branchPointId);
      const selectedTargetId = branchNode?.selectedBranchId;
      if (selectedTargetId) {
        for (const targetId of targets) {
          if (targetId !== selectedTargetId) {
            disabledNodeIds.add(targetId);
          }
        }
      }
    }
  }

  // Build requirements for each node
  const requirements: NodeRequirement[] = visibleNodes
    .filter(node => !disabledNodeIds.has(node.id))
    .map(node => {
      const outgoingTargets = outgoingEdgesMap[node.id] || [];
      const isBranchPoint = outgoingTargets.length > 1;

      const branchOptions = isBranchPoint
        ? outgoingTargets.map(targetId => {
            const targetNode = visibleNodes.find(n => n.id === targetId);
            return targetNode ? {
              id: targetId,
              title: targetNode.title,
              description: targetNode.description || '',
              // Note: pros/cons would come from Branch interface if using explicit branches
            } : null;
          }).filter(Boolean) as NodeRequirement['branchOptions']
        : [];

      const fields = node.dynamicFields || [];
      const requiredFields = fields.filter(f => f.required);
      const requiredFieldsComplete = requiredFields.every(f => !!f.value);
      const branchSelected = !isBranchPoint || !!node.selectedBranchId;
      const isComplete = requiredFieldsComplete && branchSelected;

      return {
        node,
        planId: plan.id,
        fields,
        isBranchPoint,
        branchOptions,
        isComplete,
        requiredFieldsComplete,
        branchSelected,
      };
    })
    // Only show nodes that have required fields or are branch points
    .filter(req => req.fields.some(f => f.required) || req.isBranchPoint);

  if (requirements.length === 0) {
    return null;
  }

  const completedCount = requirements.filter(r => r.isComplete).length;
  const totalCount = requirements.length;
  const allComplete = completedCount === totalCount;
  const progress = (completedCount / totalCount) * 100;

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleFieldChange = (nodeId: string, fieldId: string, value: string) => {
    updateFieldValue(nodeId, fieldId, value, plan.id);
    if (activeTabId) {
      setProjectFieldValue(activeTabId, nodeId, fieldId, value);
    }
  };

  const handleBranchSelect = (nodeId: string, branchId: string) => {
    setSelectedBranch(nodeId, branchId, plan.id);
    if (activeTabId) {
      setProjectSelectedBranch(activeTabId, nodeId, branchId);
    }
  };

  const openBranchModal = (req: NodeRequirement) => {
    setActiveBranchNode(req);
    setBranchModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-80"
      >
        <div className="bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-surface-raised/80 to-surface-raised/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  allComplete
                    ? 'bg-accent-green/20'
                    : 'bg-accent-blue/20'
                )}>
                  {allComplete ? (
                    <Sparkles className="w-4 h-4 text-accent-green" />
                  ) : (
                    <FormInput className="w-4 h-4 text-accent-blue" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Requirements
                  </h3>
                  <p className="text-[10px] text-text-muted">
                    {allComplete ? 'All set!' : 'Complete to approve'}
                  </p>
                </div>
              </div>
              <span className={clsx(
                'text-xs font-bold px-2.5 py-1 rounded-full',
                allComplete
                  ? 'bg-accent-green/20 text-accent-green'
                  : 'bg-accent-yellow/20 text-accent-yellow'
              )}>
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <motion.div
                className={clsx(
                  'h-full rounded-full',
                  allComplete ? 'bg-accent-green' : 'bg-gradient-to-r from-accent-blue to-accent-purple'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Requirements list */}
          <div className="max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {requirements.map((req, index) => {
                const isExpanded = expandedNodes.has(req.node.id);
                const isSelected = selectedNodeId === req.node.id;

                return (
                  <motion.div
                    key={req.node.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.02 }}
                    className={clsx(
                      'border-b border-border/50 last:border-b-0',
                      isSelected && 'bg-accent-blue/5'
                    )}
                  >
                    {/* Node header */}
                    <button
                      onClick={() => {
                        toggleExpand(req.node.id);
                        setSelectedNodeId(req.node.id, req.planId);
                      }}
                      className={clsx(
                        'w-full px-4 py-3 flex items-center gap-3',
                        'hover:bg-surface-raised/50 transition-colors'
                      )}
                    >
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {req.isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-accent-green" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-muted" />
                        )}
                      </div>

                      {/* Node info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            'text-sm font-medium truncate',
                            req.isComplete ? 'text-text-muted' : 'text-text-primary'
                          )}>
                            {req.node.title}
                          </span>
                          {req.isBranchPoint && (
                            <GitBranch className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {req.fields.length > 0 && (
                            <span className="text-[10px] text-text-muted">
                              {req.fields.filter(f => f.required && f.value).length}/{req.fields.filter(f => f.required).length} fields
                            </span>
                          )}
                          {req.isBranchPoint && (
                            <span className={clsx(
                              'text-[10px]',
                              req.branchSelected ? 'text-accent-green' : 'text-accent-yellow'
                            )}>
                              {req.branchSelected ? 'Path selected' : 'Choose path'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand indicator */}
                      <ChevronRight className={clsx(
                        'w-4 h-4 text-text-muted transition-transform',
                        isExpanded && 'rotate-90'
                      )} />
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-3">
                            {/* Branch selection button */}
                            {req.isBranchPoint && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBranchModal(req);
                                }}
                                className={clsx(
                                  'w-full p-3 rounded-xl border-2 transition-all',
                                  'flex items-center justify-between',
                                  req.branchSelected
                                    ? 'border-accent-green/50 bg-accent-green/5 hover:bg-accent-green/10'
                                    : 'border-accent-purple/50 bg-accent-purple/5 hover:bg-accent-purple/10'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <GitBranch className={clsx(
                                    'w-4 h-4',
                                    req.branchSelected ? 'text-accent-green' : 'text-accent-purple'
                                  )} />
                                  <span className="text-sm font-medium text-text-primary">
                                    {req.branchSelected
                                      ? req.branchOptions.find(b => b.id === req.node.selectedBranchId)?.title || 'Selected'
                                      : `Choose from ${req.branchOptions.length} paths`
                                    }
                                  </span>
                                </div>
                                <ChevronDown className={clsx(
                                  'w-4 h-4',
                                  req.branchSelected ? 'text-accent-green' : 'text-accent-purple'
                                )} />
                              </button>
                            )}

                            {/* Dynamic fields */}
                            {req.fields.length > 0 && (
                              <div className="space-y-2">
                                {req.fields.map(field => (
                                  <FieldInput
                                    key={field.id}
                                    field={field}
                                    onChange={(value) => handleFieldChange(req.node.id, field.id, value)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {allComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 py-3 border-t border-border bg-gradient-to-r from-accent-green/10 to-accent-green/5"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <p className="text-sm text-accent-green font-medium">
                  Ready to approve!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="px-4 py-2 border-t border-border bg-surface-raised/30">
              <p className="text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Click items to expand and fill requirements
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Branch Selection Modal */}
      {activeBranchNode && (
        <BranchSelectionModal
          isOpen={branchModalOpen}
          onClose={() => {
            setBranchModalOpen(false);
            setActiveBranchNode(null);
          }}
          nodeTitle={activeBranchNode.node.title}
          branches={activeBranchNode.branchOptions}
          selectedBranchId={activeBranchNode.node.selectedBranchId}
          onSelect={(branchId) => handleBranchSelect(activeBranchNode.node.id, branchId)}
        />
      )}
    </>
  );
}

// Compact field input component
interface FieldInputProps {
  field: DynamicField;
  onChange: (value: string) => void;
}

function FieldInput({ field, onChange }: FieldInputProps) {
  const hasValue = !!field.value;

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-xs font-medium text-text-primary">
        {field.title}
        {field.required && <span className="text-accent-red">*</span>}
        {hasValue && <CheckCircle2 className="w-3 h-3 text-accent-green ml-auto" />}
      </label>

      {field.description && (
        <p className="text-[10px] text-text-muted">{field.description}</p>
      )}

      {field.type === 'select' ? (
        <select
          value={field.value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            'w-full px-2.5 py-1.5 rounded-lg text-xs',
            'bg-canvas border border-border',
            'text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue/50'
          )}
        >
          <option value="">Select...</option>
          {field.options?.split(',').map(opt => (
            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={field.value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
              className="sr-only"
            />
            <div className={clsx(
              'w-8 h-5 rounded-full transition-colors',
              field.value === 'true' ? 'bg-accent-blue' : 'bg-border'
            )}>
              <div className={clsx(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                field.value === 'true' ? 'translate-x-3.5' : 'translate-x-0.5'
              )} />
            </div>
          </div>
          <span className="text-xs text-text-secondary">
            {field.value === 'true' ? 'Yes' : 'No'}
          </span>
        </label>
      ) : (
        <input
          type={field.type === 'secret' ? 'password' : field.type === 'number' ? 'number' : 'text'}
          value={field.value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.title.toLowerCase()}`}
          className={clsx(
            'w-full px-2.5 py-1.5 rounded-lg text-xs',
            'bg-canvas border border-border',
            'text-text-primary placeholder-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-accent-blue/50',
            field.type === 'secret' && 'font-mono'
          )}
        />
      )}

      {field.required && !field.value && (
        <p className="text-[10px] text-accent-yellow">Required</p>
      )}
    </div>
  );
}
