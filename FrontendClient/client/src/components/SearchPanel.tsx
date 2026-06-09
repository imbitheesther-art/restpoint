import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'cmdk';
import {
  Search,
  Loader2,
  Clock,
  Zap,
  X,
  Keyboard,
  TrendingUp,
  FileText,
  User,
  DollarSign,
  Building2,
  Calendar,
  ArrowRight,
  Sparkles,
  History,
  Trash2,
  Filter,
  Star,
  StarOff,
  ChevronRight,
  FolderOpen,
  Activity
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useRecentSearches } from '../hooks/useRecentSearches';
import SearchResultGroup from './SearchResultGroup';
import { formatDistanceToNow } from 'date-fns';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: SearchResult, type: string) => void;
  tenantSlug?: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  url?: string;
  category: string;
  score?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

interface SearchSection {
  title: string;
  icon: React.ReactNode;
  items: SearchResult[];
  priority: number;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ 
  isOpen, 
  onClose, 
  onResultSelect,
  tenantSlug 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const commandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { results, isLoading, search, error, suggestions } = useSearch();
  const { recentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch } = useRecentSearches();

  // Debounced search with typing indicator
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setIsTyping(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        search(value, filters);
        setIsTyping(false);
      }, 300);
    } else {
      setIsTyping(false);
    }
  }, [search, filters]);

  // Handle result selection
  const handleSelectResult = useCallback((result: SearchResult, category: string) => {
    addRecentSearch(query);
    if (onResultSelect) {
      onResultSelect(result, category);
    }
    onClose();
  }, [query, addRecentSearch, onResultSelect, onClose]);

  // Handle recent search click
  const handleRecentSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    search(searchTerm, filters);
    addRecentSearch(searchTerm);
  }, [search, filters, addRecentSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          // Trigger open from parent
          document.dispatchEvent(new CustomEvent('openSearch'));
        }
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      
      // Slash to focus search
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('openSearch'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Organize results by category with priority
  const organizedResults = useMemo(() => {
    if (!results) return [];
    
    const sections: SearchSection[] = [];
    const categoryOrder: Record<string, number> = {
      'deceased': 1,
      'documents': 2,
      'invoices': 3,
      'clients': 4,
      'services': 5,
      'staff': 6,
      'settings': 7
    };
    
    Object.entries(results).forEach(([category, items]) => {
      if (items && items.length > 0) {
        sections.push({
          title: category.charAt(0).toUpperCase() + category.slice(1),
          icon: getCategoryIcon(category),
          items: items.slice(0, 5),
          priority: categoryOrder[category] || 999
        });
      }
    });
    
    return sections.sort((a, b) => a.priority - b.priority);
  }, [results]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'deceased': <User className="w-4 h-4" />,
      'documents': <FileText className="w-4 h-4" />,
      'invoices': <DollarSign className="w-4 h-4" />,
      'clients': <Building2 className="w-4 h-4" />,
      'services': <Zap className="w-4 h-4" />,
      'staff': <Users className="w-4 h-4" />,
      'settings': <Settings className="w-4 h-4" />
    };
    return icons[category] || <FolderOpen className="w-4 h-4" />;
  };

  // Get trending searches (mock - would come from API)
  const trendingSearches = [
    'John Doe funeral',
    'Invoice #12345',
    'Death certificate',
    'Payment pending',
    'Memorial service'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              
              {/* Search Input Area */}
              <div className="relative">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search deceased, documents, invoices, or anything... (⌘K)"
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                  />
                  {isTyping && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  {isLoading && !isTyping && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1.5 rounded-md transition-colors ${
                      showFilters || filters.length > 0 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex flex-wrap gap-2">
                          {['deceased', 'documents', 'invoices', 'clients', 'services'].map((filter) => (
                            <button
                              key={filter}
                              onClick={() => {
                                setFilters(prev =>
                                  prev.includes(filter)
                                    ? prev.filter(f => f !== filter)
                                    : [...prev, filter]
                                );
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                filters.includes(filter)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {filter}
                            </button>
                          ))}
                          {filters.length > 0 && (
                            <button
                              onClick={() => setFilters([])}
                              className="px-3 py-1 rounded-full text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Results Area */}
              <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider">
                <Command.List className="max-h-[60vh] overflow-y-auto">
                  
                  {/* Loading State */}
                  {isLoading && !isTyping && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                      <p className="text-gray-500">Searching across all modules...</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-red-500 mb-2">Something went wrong</p>
                      <button 
                        onClick={() => search(query, filters)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* No Results */}
                  {query.length >= 2 && !isLoading && !isTyping && organizedResults.length === 0 && (
                    <div className="px-4 py-12 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No results found for "{query}"</p>
                      <p className="text-sm text-gray-500">Try different keywords or check your spelling</p>
                      
                      {/* Suggestions */}
                      {suggestions && suggestions.length > 0 && (
                        <div className="mt-6">
                          <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleSearch(suggestion)}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions when no search */}
                  {!query && (
                    <>
                      {/* Trending */}
                      <Command.Group heading="🔥 Trending Now">
                        <div className="px-2 py-2">
                          {trendingSearches.map((term) => (
                            <Command.Item
                              key={term}
                              value={term}
                              onSelect={() => handleRecentSearch(term)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                              <span className="flex-1">{term}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Command.Item>
                          ))}
                        </div>
                      </Command.Group>

                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <Command.Group heading="📜 Recent Searches">
                          <div className="px-2 py-2">
                            {recentSearches.slice(0, 5).map((term, idx) => (
                              <Command.Item
                                key={term}
                                value={term}
                                onSelect={() => handleRecentSearch(term)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-800 group"
                              >
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="flex-1">{term}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeRecentSearch(term);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                              </Command.Item>
                            ))}
                            {recentSearches.length > 0 && (
                              <button
                                onClick={clearRecentSearches}
                                className="w-full mt-2 px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                Clear all history
                              </button>
                            )}
                          </div>
                        </Command.Group>
                      )}

                      {/* Smart Suggestions */}
                      <Command.Group heading="✨ Smart Suggestions">
                        <div className="px-2 py-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleSearch('pending invoices')}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-sm hover:shadow-md transition-shadow"
                            >
                              <DollarSign className="w-4 h-4 text-yellow-600" />
                              <span>Pending Invoices</span>
                            </button>
                            <button
                              onClick={() => handleSearch('recent deaths')}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg text-sm hover:shadow-md transition-shadow"
                            >
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>Recent Deaths</span>
                            </button>
                          </div>
                        </div>
                      </Command.Group>
                    </>
                  )}

                  {/* Search Results */}
                  {query.length >= 2 && organizedResults.map((section) => (
                    <Command.Group 
                      key={section.title} 
                      heading={
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span>{section.title}</span>
                          <span className="ml-auto text-xs text-gray-400">
                            {section.items.length} results
                          </span>
                        </div>
                      }
                      className="overflow-hidden px-2 py-2"
                    >
                      {section.items.map((result, idx) => (
                        <Command.Item
                          key={result.id}
                          value={result.title}
                          onSelect={() => handleSelectResult(result, section.title.toLowerCase())}
                          className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {result.icon || section.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {result.title}
                              </span>
                              {result.score && result.score > 0.8 && (
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 mb-1">{result.subtitle}</p>
                            )}
                            {result.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                {result.description}
                              </p>
                            )}
                            {result.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>

              {/* Footer with shortcuts */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Keyboard className="w-3 h-3" />
                    <span>↑↓</span>
                    <span className="mx-1">to navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏎</span>
                    <span>to select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>ESC</span>
                    <span>to close</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  <span>AI-powered search</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Missing imports
import { Users, Settings } from 'lucide-react';

export default SearchPanel;