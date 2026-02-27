export function Footer() {
  return (
    <footer className="h-10 border-t border-border bg-surface/30 flex items-center justify-between px-4">
      <div className="text-xs text-text-muted flex items-center gap-4">
        <span>
          Built by{' '}
          <a
            href="https://trysixth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Sixth
          </a>
          {' · with ❤️ · '}
          <a
            href="https://github.com/SixHq/Overture"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-green hover:text-accent-green/80 transition-colors"
          >
            Open Source
          </a>
        </span>
        <span className="text-text-muted/70">
          Try out Overture on{' '}
          <a
            href="https://marketplace.visualstudio.com/items?itemName=Sixth.sixth-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-purple hover:text-accent-purple/80 transition-colors font-medium"
          >
            Sixth
          </a>
          {' '}with VS Code for a more optimized workflow
        </span>
      </div>

      <div className="text-xs text-text-muted">
        Press <kbd className="px-1.5 py-0.5 bg-surface rounded text-text-secondary font-mono">?</kbd> for shortcuts
      </div>
    </footer>
  );
}
