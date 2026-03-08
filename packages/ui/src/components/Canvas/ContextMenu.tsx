import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  PlusCircle,
  Edit3
} from 'lucide-react';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition;
  nodeId: string;
  planId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  canInsertBefore: boolean;
  canInsertAfter: boolean;
  onClose: () => void;
  onMoveUp: (nodeId: string, planId: string) => void;
  onMoveDown: (nodeId: string, planId: string) => void;
  onDelete: (nodeId: string, planId: string) => void;
  onInsertBefore: (nodeId: string, planId: string) => void;
  onInsertAfter: (nodeId: string, planId: string) => void;
  onEditDetails: (nodeId: string, planId: string) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function MenuItem({ icon, label, onClick, disabled = false, variant = 'default' }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm
        transition-colors duration-100
        ${disabled
          ? 'text-text-muted cursor-not-allowed'
          : variant === 'danger'
            ? 'text-accent-red hover:bg-accent-red/10'
            : 'text-text-primary hover:bg-surface-raised'
        }
      `}
    >
      <span className={disabled ? 'opacity-50' : ''}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-border my-1" />;
}

export function ContextMenu({
  isOpen,
  position,
  nodeId,
  planId,
  canMoveUp,
  canMoveDown,
  canDelete,
  canInsertBefore,
  canInsertAfter,
  onClose,
  onMoveUp,
  onMoveDown,
  onDelete,
  onInsertBefore,
  onInsertAfter,
  onEditDetails,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to catch clicks before they propagate
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Adjust position to keep menu within viewport
  const getAdjustedPosition = useCallback((): ContextMenuPosition => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 180; // Approximate width based on min-w-[180px]
    const menuHeight = 260; // Approximate height based on content

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position if menu would overflow right edge
    if (position.x + menuWidth > viewportWidth - 10) {
      adjustedX = viewportWidth - menuWidth - 10;
    }

    // Adjust vertical position if menu would overflow bottom edge
    if (position.y + menuHeight > viewportHeight - 10) {
      adjustedY = viewportHeight - menuHeight - 10;
    }

    return { x: adjustedX, y: adjustedY };
  }, [position]);

  // Get adjusted position for rendering
  const adjustedPosition = getAdjustedPosition();

  const handleMoveUp = useCallback(() => {
    onMoveUp(nodeId, planId);
    onClose();
  }, [nodeId, planId, onMoveUp, onClose]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(nodeId, planId);
    onClose();
  }, [nodeId, planId, onMoveDown, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(nodeId, planId);
    onClose();
  }, [nodeId, planId, onDelete, onClose]);

  const handleInsertBefore = useCallback(() => {
    onInsertBefore(nodeId, planId);
    onClose();
  }, [nodeId, planId, onInsertBefore, onClose]);

  const handleInsertAfter = useCallback(() => {
    onInsertAfter(nodeId, planId);
    onClose();
  }, [nodeId, planId, onInsertAfter, onClose]);

  const handleEditDetails = useCallback(() => {
    onEditDetails(nodeId, planId);
    onClose();
  }, [nodeId, planId, onEditDetails, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{
            position: 'fixed',
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            zIndex: 9999,
          }}
          className="min-w-[180px] py-1 bg-surface border border-border rounded-lg shadow-xl"
        >
          <MenuItem
            icon={<ChevronUp className="w-4 h-4" />}
            label="Move Up"
            onClick={handleMoveUp}
            disabled={!canMoveUp}
          />
          <MenuItem
            icon={<ChevronDown className="w-4 h-4" />}
            label="Move Down"
            onClick={handleMoveDown}
            disabled={!canMoveDown}
          />

          <MenuDivider />

          <MenuItem
            icon={<PlusCircle className="w-4 h-4" />}
            label="Insert Before"
            onClick={handleInsertBefore}
            disabled={!canInsertBefore}
          />
          <MenuItem
            icon={<Plus className="w-4 h-4" />}
            label="Insert After"
            onClick={handleInsertAfter}
            disabled={!canInsertAfter}
          />

          <MenuDivider />

          <MenuItem
            icon={<Edit3 className="w-4 h-4" />}
            label="Edit Details"
            onClick={handleEditDetails}
          />

          <MenuDivider />

          <MenuItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete Node"
            onClick={handleDelete}
            disabled={!canDelete}
            variant="danger"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
