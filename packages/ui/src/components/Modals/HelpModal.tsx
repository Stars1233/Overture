import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, HelpCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { helpCategories, getSearchableContent } from '@/data/help-content';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(helpCategories[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(helpCategories[0]?.id || '');
      setSelectedSectionId('');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Get the currently selected category
  const selectedCategory = useMemo(() => {
    return helpCategories.find(c => c.id === selectedCategoryId);
  }, [selectedCategoryId]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const searchable = getSearchableContent();

    return searchable.filter(item =>
      item.sectionTitle.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      item.categoryTitle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSectionId('');
    setSearchQuery('');
  }, []);

  const handleSearchResultClick = useCallback((categoryId: string, sectionId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSectionId(sectionId);
    setSearchQuery('');
  }, []);

  // Scroll to section when selected from search
  useEffect(() => {
    if (selectedSectionId) {
      const element = document.getElementById(`help-section-${selectedSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedSectionId]);

  // Render markdown-like content with basic formatting
  const renderContent = useCallback((content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const processLine = (line: string, index: number): JSX.Element | null => {
      // Code block handling
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeContent = codeLines.join('\n');
          codeLines = [];
          return (
            <pre
              key={index}
              className="bg-canvas border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono text-text-secondary my-3"
            >
              <code>{codeContent}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return null;
      }

      // Table handling
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        if (cells.length > 0) {
          // Check if this is a separator row
          if (cells.every(c => /^[-:]+$/.test(c))) {
            // Skip separator, render table if we have rows
            inTable = true;
            return null;
          }
          tableRows.push(cells);
          return null;
        }
      } else if (inTable && tableRows.length > 0) {
        // End of table, render it
        inTable = false;
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1);
        tableRows = [];
        return (
          <div key={index} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {headerRow.map((cell, i) => (
                    <th key={i} className="text-left py-2 px-3 text-text-primary font-medium">
                      {renderInlineFormatting(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border/50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-2 px-3 text-text-secondary">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={index} className="h-3" />;
      }

      // Headings
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.slice(2, -2);
        return (
          <h4 key={index} className="font-semibold text-text-primary mt-4 mb-2">
            {text}
          </h4>
        );
      }

      // List items
      if (line.startsWith('- ')) {
        const text = line.slice(2);
        return (
          <li key={index} className="text-text-secondary ml-4 list-disc list-inside mb-1">
            {renderInlineFormatting(text)}
          </li>
        );
      }

      // Numbered list items
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        return (
          <li key={index} className="text-text-secondary ml-4 list-decimal list-inside mb-1">
            {renderInlineFormatting(numberedMatch[2])}
          </li>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-text-secondary mb-2">
          {renderInlineFormatting(line)}
        </p>
      );
    };

    // Handle inline formatting
    const renderInlineFormatting = (text: string): JSX.Element => {
      // Process bold, inline code, etc.
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let keyCounter = 0;

      while (remaining.length > 0) {
        // Inline code
        const codeMatch = remaining.match(/`([^`]+)`/);
        if (codeMatch && codeMatch.index !== undefined) {
          if (codeMatch.index > 0) {
            parts.push(processBold(remaining.slice(0, codeMatch.index), keyCounter++));
          }
          parts.push(
            <code
              key={`code-${keyCounter++}`}
              className="px-1.5 py-0.5 bg-surface-raised rounded text-accent-purple font-mono text-sm"
            >
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
          continue;
        }

        // No more special formatting
        parts.push(processBold(remaining, keyCounter++));
        break;
      }

      return <>{parts}</>;
    };

    // Process bold text
    const processBold = (text: string, key: number): string | JSX.Element => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let keyCounter = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          parts.push(
            <strong key={`bold-${key}-${keyCounter++}`} className="font-semibold text-text-primary">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          continue;
        }
        parts.push(remaining);
        break;
      }

      if (parts.length === 1 && typeof parts[0] === 'string') {
        return parts[0];
      }
      return <span key={`span-${key}`}>{parts}</span>;
    };

    lines.forEach((line, index) => {
      const element = processLine(line, index);
      if (element) {
        elements.push(element);
      }
    });

    // Handle any remaining table
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      elements.push(
        <div key="final-table" className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headerRow.map((cell, i) => (
                  <th key={i} className="text-left py-2 px-3 text-text-primary font-medium">
                    {renderInlineFormatting(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-2 px-3 text-text-secondary">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  }, []);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-canvas"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue via-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-blue/20">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">Help & Documentation</h1>
                  <p className="text-xs text-text-muted">Learn how to use Overture effectively</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-surface-overlay flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Sidebar - Categories */}
              <aside className="w-64 border-r border-border bg-surface/50 flex flex-col shrink-0">
                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search help..."
                      className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border rounded-xl
                               text-sm text-text-primary placeholder:text-text-muted
                               focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                    />
                  </div>
                </div>

                {/* Category List */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Topics
                  </h3>
                  <div className="space-y-1">
                    {helpCategories.map(category => {
                      const Icon = category.icon;
                      const isSelected = selectedCategoryId === category.id && !searchQuery;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={clsx(
                            'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3',
                            isSelected
                              ? 'bg-accent-blue/10 text-accent-blue font-medium'
                              : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                          )}
                        >
                          <Icon className={clsx(
                            'w-4 h-4 shrink-0',
                            isSelected ? 'text-accent-blue' : 'text-text-muted'
                          )} />
                          {category.title}
                        </button>
                      );
                    })}
                  </div>
                </nav>

                {/* External Links */}
                <div className="p-4 border-t border-border">
                  <a
                    href="https://github.com/SixHq/overture"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    GitHub Repository
                  </a>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto">
                {searchQuery && searchResults ? (
                  /* Search Results */
                  <div className="p-6 max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-text-primary mb-1">Search Results</h2>
                    <p className="text-sm text-text-muted mb-6">
                      {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                    </p>

                    {searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <p className="text-text-primary font-medium">No results found</p>
                        <p className="text-text-muted text-sm mt-1">Try different keywords</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map((result, index) => (
                          <motion.button
                            key={`${result.categoryId}-${result.sectionId}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleSearchResultClick(result.categoryId, result.sectionId)}
                            className="w-full text-left p-4 rounded-xl border border-border bg-surface hover:border-accent-blue/50 hover:bg-surface-raised transition-all group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue font-medium">
                                {result.categoryTitle}
                              </span>
                              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-blue group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <h3 className="font-semibold text-text-primary mb-1">{result.sectionTitle}</h3>
                            <p className="text-sm text-text-muted line-clamp-2">
                              {result.content.slice(0, 150)}...
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : selectedCategory ? (
                  /* Category Content */
                  <div className="p-6 max-w-4xl mx-auto">
                    {/* Category Header */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center">
                        <selectedCategory.icon className="w-7 h-7 text-accent-blue" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text-primary">{selectedCategory.title}</h2>
                        <p className="text-text-muted">
                          {selectedCategory.sections.length} {selectedCategory.sections.length === 1 ? 'topic' : 'topics'}
                        </p>
                      </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-10">
                      {selectedCategory.sections.map((section, index) => (
                        <motion.section
                          key={section.id}
                          id={`help-section-${section.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={clsx(
                            'scroll-mt-6',
                            selectedSectionId === section.id && 'ring-2 ring-accent-blue/30 ring-offset-4 ring-offset-canvas rounded-xl'
                          )}
                        >
                          <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-accent-blue/10 flex items-center justify-center text-sm font-bold text-accent-blue">
                              {index + 1}
                            </span>
                            {section.title}
                          </h3>
                          <div className="prose prose-invert max-w-none">
                            {renderContent(section.content)}
                          </div>
                        </motion.section>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <HelpCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      <p className="text-text-primary font-medium">Select a topic to get started</p>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
