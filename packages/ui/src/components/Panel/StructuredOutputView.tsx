import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Editor from '@monaco-editor/react';
import {
  ChevronDown,
  ChevronRight,
  FileEdit,
  FilePlus,
  FileX,
  Package,
  Server,
  Search,
  Wrench,
  ExternalLink,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import type { StructuredOutput, FileChange, FileCreated } from '@/stores/plan-store';
import { MonacoViewerModal, FileViewerMode } from '@/components/Modals/MonacoViewerModal';

/**
 * Maps file extensions to Monaco editor language identifiers.
 */
function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    // Data formats
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    toml: 'ini',
    // Documentation
    md: 'markdown',
    mdx: 'markdown',
    // Python
    py: 'python',
    pyi: 'python',
    pyw: 'python',
    // Backend
    go: 'go',
    rs: 'rust',
    java: 'java',
    kt: 'kotlin',
    kts: 'kotlin',
    scala: 'scala',
    rb: 'ruby',
    php: 'php',
    // C family
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    cxx: 'cpp',
    hpp: 'cpp',
    hxx: 'cpp',
    cs: 'csharp',
    // Shell
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    ps1: 'powershell',
    // Config
    env: 'ini',
    ini: 'ini',
    conf: 'ini',
    cfg: 'ini',
    // SQL
    sql: 'sql',
    // GraphQL
    graphql: 'graphql',
    gql: 'graphql',
    // Docker
    dockerfile: 'dockerfile',
    // Swift/Objective-C
    swift: 'swift',
    m: 'objective-c',
    mm: 'objective-c',
    // Lua
    lua: 'lua',
    // R
    r: 'r',
    // Dart
    dart: 'dart',
    // Elixir/Erlang
    ex: 'elixir',
    exs: 'elixir',
    erl: 'erlang',
    // Haskell
    hs: 'haskell',
    // Clojure
    clj: 'clojure',
    cljs: 'clojure',
    cljc: 'clojure',
    // Vue/Svelte
    vue: 'html',
    svelte: 'html',
  };

  // Handle special filenames
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename === 'dockerfile' || lowerFilename.startsWith('dockerfile.')) {
    return 'dockerfile';
  }
  if (lowerFilename === 'makefile' || lowerFilename === 'gnumakefile') {
    return 'makefile';
  }

  return languageMap[ext] || 'plaintext';
}

/**
 * Detects if content is a diff format and returns appropriate language.
 */
function isDiffContent(content: string): boolean {
  // Check for common diff markers
  return (
    content.includes('@@') &&
    (content.includes('+') || content.includes('-')) &&
    (content.includes('---') || content.includes('+++'))
  );
}

/**
 * Copy button component with visual feedback.
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-surface-raised transition-colors text-text-muted hover:text-text-primary"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-accent-green" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/**
 * Monaco Editor wrapper with custom dark theme matching the app.
 */
interface CodeEditorProps {
  content: string;
  language: string;
  height?: string;
}

function CodeEditor({ content, language, height = '200px' }: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={content}
      theme="vs-dark"
      loading={
        <div className="flex items-center justify-center h-full bg-surface-raised text-text-muted text-xs">
          Loading editor...
        </div>
      }
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        folding: true,
        fontSize: 11,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        wordWrap: 'on',
        automaticLayout: true,
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        overviewRulerBorder: false,
        renderLineHighlight: 'none',
        hideCursorInOverviewRuler: true,
        contextmenu: false,
        domReadOnly: true,
        padding: { top: 8, bottom: 8 },
      }}
      beforeMount={(monaco) => {
        // Define custom dark theme to match app colors
        monaco.editor.defineTheme('overture-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#18181b', // surface color
            'editor.foreground': '#fafafa', // text-primary
            'editorLineNumber.foreground': '#71717a', // text-muted
            'editorLineNumber.activeForeground': '#a1a1aa', // text-secondary
            'editor.selectionBackground': '#3b82f640', // accent-blue with opacity
            'editor.lineHighlightBackground': '#27272a', // surface-raised
            'editorGutter.background': '#18181b', // surface
            'scrollbarSlider.background': '#3f3f4680', // border with opacity
            'scrollbarSlider.hoverBackground': '#52525b', // border-subtle
          },
        });
      }}
      onMount={(_editor, monaco) => {
        // Apply custom theme after mount
        monaco.editor.setTheme('overture-dark');
      }}
    />
  );
}

/**
 * Calculates appropriate editor height based on content.
 */
function calculateEditorHeight(content: string, maxHeight = 300, minHeight = 80): string {
  const lineCount = content.split('\n').length;
  const lineHeight = 18; // Approximate line height for font-size 11
  const padding = 16; // Top and bottom padding
  const calculatedHeight = lineCount * lineHeight + padding;
  const clampedHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
  return `${clampedHeight}px`;
}

/**
 * Collapsible file change item with Monaco Editor.
 */
interface FileChangeItemProps {
  file: FileChange;
  onViewInEditor?: (file: FileChange) => void;
}

function FileChangeItem({ file, onViewInEditor }: FileChangeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = Boolean(file.diff);
  const language = hasDiff && isDiffContent(file.diff!) ? 'plaintext' : getLanguageFromFilename(file.path);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewInEditor && hasDiff) {
      onViewInEditor(file);
    }
  };

  return (
    <div className="border border-border/30 rounded-md overflow-hidden">
      <button
        onClick={() => hasDiff && setExpanded(!expanded)}
        disabled={!hasDiff}
        className={clsx(
          'w-full px-2.5 py-1.5 flex items-center gap-2 bg-surface transition-colors text-left',
          hasDiff && 'hover:bg-surface-raised cursor-pointer',
          !hasDiff && 'cursor-default',
          expanded && 'border-b border-border/30'
        )}
      >
        {hasDiff && (
          expanded ? (
            <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-text-muted shrink-0" />
          )
        )}
        {!hasDiff && <div className="w-3" />}
        <span className="text-xs font-mono text-text-primary truncate flex-1">{file.path}</span>
        <div className="flex items-center gap-2 shrink-0">
          {file.linesAdded !== undefined && file.linesAdded > 0 && (
            <span className="text-accent-green text-[10px] flex items-center gap-0.5">
              <Plus className="w-2.5 h-2.5" />
              {file.linesAdded}
            </span>
          )}
          {file.linesRemoved !== undefined && file.linesRemoved > 0 && (
            <span className="text-accent-red text-[10px] flex items-center gap-0.5">
              <Minus className="w-2.5 h-2.5" />
              {file.linesRemoved}
            </span>
          )}
          {hasDiff && (
            <>
              <button
                onClick={handleViewClick}
                className="p-1 rounded hover:bg-surface-raised transition-colors text-text-muted hover:text-accent-blue"
                title="View in full editor"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <CopyButton text={file.diff!} />
            </>
          )}
        </div>
      </button>
      <AnimatePresence>
        {expanded && file.diff && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/20">
              <CodeEditor
                content={file.diff}
                language={language}
                height={calculateEditorHeight(file.diff)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Collapsible file created item with Monaco Editor for content preview.
 */
interface FileCreatedItemProps {
  file: FileCreated;
  onViewInEditor?: (file: FileCreated) => void;
}

function FileCreatedItem({ file, onViewInEditor }: FileCreatedItemProps) {
  const hasContent = Boolean(file.content);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewInEditor && hasContent) {
      onViewInEditor(file);
    }
  };

  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-2 bg-surface/50 rounded hover:bg-surface-raised transition-colors">
      <span className="font-mono text-text-primary truncate">{file.path}</span>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {file.lines !== undefined && (
          <span className="text-text-muted">{file.lines} lines</span>
        )}
        {hasContent && (
          <button
            onClick={handleViewClick}
            className="p-1 rounded hover:bg-surface-raised transition-colors text-text-muted hover:text-accent-green"
            title="View file content"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

type AccentColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

const iconColorClasses: Record<AccentColor, string> = {
  blue: 'text-accent-blue',
  green: 'text-accent-green',
  yellow: 'text-accent-yellow',
  red: 'text-accent-red',
  purple: 'text-accent-purple',
};

const badgeClasses: Record<AccentColor, string> = {
  blue: 'bg-accent-blue/10 text-accent-blue',
  green: 'bg-accent-green/10 text-accent-green',
  yellow: 'bg-accent-yellow/10 text-accent-yellow',
  red: 'bg-accent-red/10 text-accent-red',
  purple: 'bg-accent-purple/10 text-accent-purple',
};

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
  defaultExpanded?: boolean;
  accentColor?: AccentColor;
  children: React.ReactNode;
}

function ExpandableSection({
  title,
  icon,
  count,
  defaultExpanded = false,
  accentColor = 'blue',
  children,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border/50 rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={clsx(
          'w-full px-2.5 py-1.5 flex items-center gap-2 bg-surface-raised hover:bg-surface transition-colors',
          expanded && 'border-b border-border/50'
        )}
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-text-muted" />
        ) : (
          <ChevronRight className="w-3 h-3 text-text-muted" />
        )}
        <span className={iconColorClasses[accentColor]}>{icon}</span>
        <span className="text-xs font-medium text-text-primary flex-1 text-left">
          {title}
        </span>
        {count !== undefined && (
          <span className={clsx('text-[10px] px-1.5 py-0.5 rounded', badgeClasses[accentColor])}>
            {count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-2.5 bg-canvas">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StructuredOutputViewProps {
  output: StructuredOutput;
}

// Modal state for viewing files
interface FileViewerState {
  isOpen: boolean;
  filePath: string;
  content?: string;
  diff?: string;
  mode: FileViewerMode;
  linesAdded?: number;
  linesRemoved?: number;
}

export function StructuredOutputView({ output }: StructuredOutputViewProps) {
  // Modal state for file viewer
  const [fileViewer, setFileViewer] = useState<FileViewerState>({
    isOpen: false,
    filePath: '',
    mode: 'created',
  });

  // Handler for viewing changed files
  const handleViewChangedFile = useCallback((file: FileChange) => {
    setFileViewer({
      isOpen: true,
      filePath: file.path,
      diff: file.diff,
      mode: 'changed',
      linesAdded: file.linesAdded,
      linesRemoved: file.linesRemoved,
    });
  }, []);

  // Handler for viewing created files
  const handleViewCreatedFile = useCallback((file: FileCreated) => {
    setFileViewer({
      isOpen: true,
      filePath: file.path,
      content: file.content,
      mode: 'created',
    });
  }, []);

  // Close modal handler
  const handleCloseViewer = useCallback(() => {
    setFileViewer((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const hasContent =
    output.overview ||
    output.filesChanged?.length ||
    output.filesCreated?.length ||
    output.filesDeleted?.length ||
    output.packagesInstalled?.length ||
    output.mcpSetup?.length ||
    output.webSearches?.length ||
    output.toolCalls?.length ||
    output.previewUrls?.length ||
    output.notes?.length;

  if (!hasContent) {
    return output.raw ? (
      <pre className="text-[10px] text-text-secondary font-mono whitespace-pre-wrap">
        {output.raw}
      </pre>
    ) : null;
  }

  return (
    <>
    {/* Monaco Viewer Modal */}
    <MonacoViewerModal
      isOpen={fileViewer.isOpen}
      onClose={handleCloseViewer}
      filePath={fileViewer.filePath}
      content={fileViewer.content}
      diff={fileViewer.diff}
      mode={fileViewer.mode}
      linesAdded={fileViewer.linesAdded}
      linesRemoved={fileViewer.linesRemoved}
    />

    <div className="space-y-2">
      {/* Overview - always visible */}
      {output.overview && (
        <div className="p-2.5 rounded-md bg-accent-green/5 border border-accent-green/20">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-green mt-0.5 shrink-0" />
            <p className="text-xs text-text-primary leading-relaxed">{output.overview}</p>
          </div>
        </div>
      )}

      {/* Notes/Warnings - always visible if present */}
      {output.notes && output.notes.length > 0 && (
        <div className="space-y-1.5">
          {output.notes.map((note, i) => (
            <div
              key={i}
              className={clsx('p-2 rounded-md flex items-start gap-2', {
                'bg-accent-blue/5 border border-accent-blue/20': note.type === 'info',
                'bg-accent-yellow/5 border border-accent-yellow/20': note.type === 'warning',
                'bg-accent-red/5 border border-accent-red/20': note.type === 'error',
              })}
            >
              {note.type === 'info' && <Info className="w-3.5 h-3.5 text-accent-blue mt-0.5 shrink-0" />}
              {note.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-accent-yellow mt-0.5 shrink-0" />}
              {note.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-accent-red mt-0.5 shrink-0" />}
              <p className="text-[11px] text-text-secondary">{note.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview URLs - always visible if present */}
      {output.previewUrls && output.previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {output.previewUrls.map((url, i) => (
            <a
              key={i}
              href={url.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 transition-colors text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              {url.type || 'Preview'}
            </a>
          ))}
        </div>
      )}

      {/* Files Changed */}
      {output.filesChanged && output.filesChanged.length > 0 && (
        <ExpandableSection
          title="Files Changed"
          icon={<FileEdit className="w-3 h-3" />}
          count={output.filesChanged.length}
          accentColor="yellow"
        >
          <div className="space-y-3">
            {output.filesChanged.map((file, i) => (
              <FileChangeItem key={i} file={file} onViewInEditor={handleViewChangedFile} />
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Files Created */}
      {output.filesCreated && output.filesCreated.length > 0 && (
        <ExpandableSection
          title="Files Created"
          icon={<FilePlus className="w-3 h-3" />}
          count={output.filesCreated.length}
          accentColor="green"
        >
          <div className="space-y-1.5">
            {output.filesCreated.map((file, i) => (
              <FileCreatedItem key={i} file={file} onViewInEditor={handleViewCreatedFile} />
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Files Deleted */}
      {output.filesDeleted && output.filesDeleted.length > 0 && (
        <ExpandableSection
          title="Files Deleted"
          icon={<FileX className="w-3 h-3" />}
          count={output.filesDeleted.length}
          accentColor="red"
        >
          <div className="space-y-1">
            {output.filesDeleted.map((file, i) => (
              <div key={i} className="text-xs font-mono text-text-secondary line-through">
                {file.path}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Packages Installed */}
      {output.packagesInstalled && output.packagesInstalled.length > 0 && (
        <ExpandableSection
          title="Packages Installed"
          icon={<Package className="w-3 h-3" />}
          count={output.packagesInstalled.length}
          accentColor="blue"
        >
          <div className="flex flex-wrap gap-1.5">
            {output.packagesInstalled.map((pkg, i) => (
              <span
                key={i}
                className={clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono',
                  pkg.dev
                    ? 'bg-accent-purple/10 text-accent-purple'
                    : 'bg-accent-blue/10 text-accent-blue'
                )}
              >
                {pkg.name}
                {pkg.version && <span className="text-text-muted">@{pkg.version}</span>}
                {pkg.dev && <span className="text-[9px]">(dev)</span>}
              </span>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* MCP Setup */}
      {output.mcpSetup && output.mcpSetup.length > 0 && (
        <ExpandableSection
          title="MCP Servers"
          icon={<Server className="w-3 h-3" />}
          count={output.mcpSetup.length}
          accentColor="purple"
        >
          <div className="space-y-1.5">
            {output.mcpSetup.map((server, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className={clsx('w-1.5 h-1.5 rounded-full', {
                    'bg-accent-green': server.status === 'installed' || server.status === 'configured',
                    'bg-accent-red': server.status === 'failed',
                  })}
                />
                <span className="font-medium text-text-primary">{server.name}</span>
                <span className="text-text-muted capitalize">{server.status}</span>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Web Searches */}
      {output.webSearches && output.webSearches.length > 0 && (
        <ExpandableSection
          title="Web Searches"
          icon={<Search className="w-3 h-3" />}
          count={output.webSearches.length}
          accentColor="blue"
        >
          <div className="space-y-1">
            {output.webSearches.map((search, i) => (
              <div key={i} className="text-xs flex items-center justify-between">
                <span className="text-text-primary truncate">"{search.query}"</span>
                {search.resultsUsed !== undefined && (
                  <span className="text-text-muted shrink-0 ml-2">{search.resultsUsed} results used</span>
                )}
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Tool Calls */}
      {output.toolCalls && output.toolCalls.length > 0 && (
        <ExpandableSection
          title="Tool Usage"
          icon={<Wrench className="w-3 h-3" />}
          count={output.toolCalls.reduce((sum, t) => sum + t.count, 0)}
          accentColor="blue"
        >
          <div className="flex flex-wrap gap-1.5">
            {output.toolCalls.map((tool, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised text-[10px]"
              >
                <span className="font-medium text-text-primary">{tool.name}</span>
                <span className="text-text-muted">×{tool.count}</span>
              </span>
            ))}
          </div>
        </ExpandableSection>
      )}
    </div>
    </>
  );
}
