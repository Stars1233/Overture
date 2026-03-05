import { useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode, FilePlus, FileEdit, Copy, Check } from 'lucide-react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useState } from 'react';

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
 * Parses a diff to extract the starting line number from hunk headers.
 * Returns the first changed line number or 1 if not found.
 */
function getFirstChangedLine(diff: string): number {
  // Match hunk headers like @@ -1,5 +1,7 @@ or @@ -10 +10,3 @@
  const hunkMatch = diff.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (hunkMatch && hunkMatch[1]) {
    return parseInt(hunkMatch[1], 10);
  }
  return 1;
}

/**
 * Extracts line numbers of changed lines from a diff.
 */
function getChangedLineNumbers(diff: string): { added: number[]; removed: number[] } {
  const added: number[] = [];
  const removed: number[] = [];

  const lines = diff.split('\n');
  let currentLine = 1;
  let inHunk = false;

  for (const line of lines) {
    // Check for hunk header
    const hunkMatch = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = parseInt(hunkMatch[2], 10);
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith('+') && !line.startsWith('+++')) {
      added.push(currentLine);
      currentLine++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removed.push(currentLine);
      // Don't increment for removed lines in the new file
    } else if (!line.startsWith('\\')) {
      // Context line
      currentLine++;
    }
  }

  return { added, removed };
}

export type FileViewerMode = 'created' | 'changed' | 'diff';

interface MonacoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  content?: string;        // For created files or full file content
  diff?: string;           // For changed files
  mode: FileViewerMode;
  linesAdded?: number;
  linesRemoved?: number;
}

export function MonacoViewerModal({
  isOpen,
  onClose,
  filePath,
  content,
  diff,
  mode,
  linesAdded,
  linesRemoved,
}: MonacoViewerModalProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const [copied, setCopied] = useState(false);

  const language = getLanguageFromFilename(filePath);
  const fileName = filePath.split('/').pop() || filePath;

  // Determine the content to display
  const displayContent = mode === 'diff' ? diff || '' : content || diff || '';

  // Copy to clipboard handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [displayContent]);

  // Scroll to first changed line for diffs
  useEffect(() => {
    if (!isOpen || !editorRef.current || !diff || mode !== 'changed') return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Small delay to ensure editor is fully rendered
    const timeoutId = setTimeout(() => {
      const firstLine = getFirstChangedLine(diff);
      editor.revealLineInCenter(firstLine);

      // Add decorations for changed lines
      if (monaco) {
        const { added } = getChangedLineNumbers(diff);
        const decorations: editor.IModelDeltaDecoration[] = added.map((lineNum) => ({
          range: new monaco.Range(lineNum, 1, lineNum, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-changed-line',
            glyphMarginClassName: 'monaco-changed-glyph',
          },
        }));

        decorationsRef.current = editor.deltaDecorations(
          decorationsRef.current,
          decorations
        );
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isOpen, diff, mode]);

  // Handle editor mount
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom theme
    monaco.editor.defineTheme('overture-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a9955' },
        { token: 'keyword', foreground: '569cd6' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'type', foreground: '4ec9b0' },
      ],
      colors: {
        'editor.background': '#0a0a0b',
        'editor.foreground': '#fafafa',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editor.selectionBackground': '#3b82f640',
        'editor.lineHighlightBackground': '#18181b',
        'editorGutter.background': '#0a0a0b',
        'scrollbarSlider.background': '#27272a80',
        'scrollbarSlider.hoverBackground': '#3f3f46',
        'editorWidget.background': '#18181b',
        'editorWidget.border': '#27272a',
      },
    });

    monaco.editor.setTheme('overture-dark');
  };

  // Get the icon based on mode
  const ModeIcon = mode === 'created' ? FilePlus : mode === 'changed' ? FileEdit : FileCode;
  const modeColor = mode === 'created' ? 'accent-green' : mode === 'changed' ? 'accent-yellow' : 'accent-blue';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-5xl h-[85vh] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-${modeColor} to-${modeColor}/60 flex items-center justify-center shadow-lg`}>
                  <ModeIcon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-text-primary truncate">{fileName}</h2>
                  <p className="text-xs text-text-muted truncate" title={filePath}>{filePath}</p>
                </div>

                {/* Stats for changed files */}
                {mode === 'changed' && (linesAdded !== undefined || linesRemoved !== undefined) && (
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {linesAdded !== undefined && linesAdded > 0 && (
                      <span className="text-accent-green font-medium">+{linesAdded}</span>
                    )}
                    {linesRemoved !== undefined && linesRemoved > 0 && (
                      <span className="text-accent-red font-medium">-{linesRemoved}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-4">
                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="w-9 h-9 rounded-xl bg-surface-raised hover:bg-surface-overlay flex items-center justify-center transition-colors"
                  title={copied ? 'Copied!' : 'Copy content'}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-accent-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-muted" />
                  )}
                </button>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-surface-raised hover:bg-surface-overlay flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </header>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              {displayContent ? (
                <Editor
                  height="100%"
                  language={mode === 'diff' ? 'plaintext' : language}
                  value={displayContent}
                  theme="overture-dark"
                  loading={
                    <div className="flex items-center justify-center h-full bg-canvas text-text-muted text-sm">
                      Loading editor...
                    </div>
                  }
                  onMount={handleEditorDidMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: true, scale: 1 },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    folding: true,
                    fontSize: 13,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10,
                    },
                    overviewRulerBorder: false,
                    renderLineHighlight: 'line',
                    hideCursorInOverviewRuler: true,
                    contextmenu: true,
                    domReadOnly: true,
                    padding: { top: 16, bottom: 16 },
                    guides: {
                      indentation: true,
                      bracketPairs: true,
                    },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-canvas text-text-muted">
                  <FileCode className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm">No content available to display</p>
                  <p className="text-xs mt-1 text-text-muted/60">
                    The file content was not included in the output
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="h-12 border-t border-border bg-surface/50 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="px-2 py-1 bg-surface-raised rounded-md font-mono">
                  {language}
                </span>
                {displayContent && (
                  <span>{displayContent.split('\n').length} lines</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
              >
                Close
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
