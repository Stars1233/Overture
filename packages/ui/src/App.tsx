import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PlanCanvas } from './components/Canvas/PlanCanvas';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { NodeDetailPanel } from './components/Panel/NodeDetailPanel';
import { ApproveButton } from './components/Controls/ApproveButton';
import { InsertNodeModal } from './components/Modals/InsertNodeModal';
import { HistoryPanel } from './components/Panel/HistoryPanel';
import { PlanDiffPanel } from './components/Panel/PlanDiffPanel';
import { RequirementsChecklistV2 } from './components/Controls/RequirementsChecklistV2';
import { usePlanStore } from './stores/plan-store';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { selectedNodeId, plans, canApprove } = usePlanStore();
  const { approvePlan, pauseExecution, resumeExecution, loadPlan } = useWebSocket();

  // DEBUG: Verify new build is loaded
  console.log('[App BUILD-v2] Rendering, plans:', plans.length);

  // Find plans with specific statuses for keyboard shortcuts
  const readyPlan = [...plans].reverse().find(p => p.plan.status === 'ready');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to approve the ready plan
      if (e.key === 'Enter' && readyPlan && canApprove(readyPlan.plan.id)) {
        e.preventDefault();
        approvePlan(readyPlan.plan.id);
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        usePlanStore.getState().setSelectedNodeId(null);
      }
      // Space to pause/resume (only when not typing in an input)
      // Find any executing or paused plan
      const executingPlan = plans.find(p => p.plan.status === 'executing' || p.plan.status === 'paused');
      if (e.key === ' ' && executingPlan) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (executingPlan.plan.status === 'paused') {
            resumeExecution(executingPlan.plan.id);
          } else {
            pauseExecution(executingPlan.plan.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [plans, readyPlan, canApprove, approvePlan, pauseExecution, resumeExecution]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-canvas">
      <Header />

      <main className="flex-1 relative">
        <ReactFlowProvider>
          <PlanCanvas />
        </ReactFlowProvider>

        {/* Requirements checklist v2 - shown when plan is ready */}
        <RequirementsChecklistV2 />

        {/* Approve button - shown when plan is ready */}
        <ApproveButton />

        {/* Side panel for node details */}
        {selectedNodeId && <NodeDetailPanel />}

        {/* History panel */}
        <HistoryPanel onLoadPlan={loadPlan} />

        {/* Diff panel - shown when plan is updated */}
        <PlanDiffPanel />
      </main>

      <Footer />

      {/* Insert node modal */}
      <InsertNodeModal />
    </div>
  );
}

export default App;
