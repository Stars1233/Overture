import { usePlanStore } from '@/stores/plan-store';
import { useMultiProjectStore } from '@/stores/multi-project-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Zap, Pause, Play, History } from 'lucide-react';
import { TabBar } from './TabBar';

export function Header() {
  const { plan, isConnected, completedCount, totalCount } = usePlanStore();
  const { tabs, toggleHistoryPanel, isHistoryPanelOpen } = useMultiProjectStore();
  const { pauseExecution, resumeExecution } = useWebSocket();

  const isExecuting = plan?.status === 'executing';
  const isPaused = plan?.status === 'paused';
  const isApproved = plan?.status === 'approved';
  const showPauseControls = isExecuting || isPaused || isApproved;

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const hasMultipleTabs = tabs.length > 1;

  return (
    <div className="flex flex-col">
      <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-text-primary">Overture</span>
          </div>

          {/* Plan title */}
          {plan && (
            <>
              <div className="w-px h-6 bg-border" />
              <span className="text-text-secondary text-sm">{plan.title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar - show during executing or paused */}
          {plan && (plan.status === 'executing' || plan.status === 'paused') && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">
                {completedCount}/{totalCount}
              </span>
              <div className="w-32 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-blue to-accent-green rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Pause/Resume button */}
          {showPauseControls && (
            <button
              onClick={() => isPaused ? resumeExecution() : pauseExecution()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${isPaused
                  ? 'bg-accent-green/20 text-accent-green hover:bg-accent-green/30'
                  : 'bg-surface-raised text-text-secondary hover:bg-surface-overlay'
                }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </>
              )}
            </button>
          )}

          {/* Plan status badge */}
          {plan && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                plan.status === 'streaming'
                  ? 'bg-accent-yellow/10 text-accent-yellow'
                  : plan.status === 'ready'
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : plan.status === 'approved'
                      ? 'bg-accent-purple/10 text-accent-purple'
                      : plan.status === 'executing'
                        ? 'bg-accent-yellow/10 text-accent-yellow'
                        : plan.status === 'paused'
                          ? 'bg-accent-orange/10 text-accent-orange animate-pulse'
                          : plan.status === 'completed'
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-accent-red/10 text-accent-red'
              }`}
            >
              {plan.status}
            </div>
          )}

          {/* History button - only show when no tabs */}
          {!hasMultipleTabs && (
            <button
              onClick={toggleHistoryPanel}
              className={`
                flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs
                transition-colors
                ${isHistoryPanelOpen
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-raised'
                }
              `}
              title="View History"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-accent-green" />
                <span className="text-xs text-accent-green">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tab bar - only renders when there are multiple tabs */}
      <TabBar />
    </div>
  );
}
