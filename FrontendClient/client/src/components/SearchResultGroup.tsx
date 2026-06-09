import React from 'react';
import { Command } from 'cmdk';
import {
  User,
  FileText,
  DollarSign,
  CreditCard,
  Truck,
  Users,
  Zap
} from 'lucide-react';

interface SearchResult {
  id: string | number;
  type: string;
  title: string;
  description?: string;
  data: any;
  relevance: number;
}

interface SearchResultGroupProps {
  module: string;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  deceased: <User className="w-4 h-4 text-blue-500" />,
  documents: <FileText className="w-4 h-4 text-green-500" />,
  invoices: <DollarSign className="w-4 h-4 text-purple-500" />,
  payments: <CreditCard className="w-4 h-4 text-orange-500" />,
  dispatches: <Truck className="w-4 h-4 text-red-500" />,
  users: <Users className="w-4 h-4 text-cyan-500" />,
};

const MODULE_LABELS: Record<string, string> = {
  deceased: 'Deceased',
  documents: 'Documents',
  invoices: 'Invoices',
  payments: 'Payments',
  dispatches: 'Dispatches',
  users: 'Users',
};

const SearchResultGroup: React.FC<SearchResultGroupProps> = ({
  module,
  results,
  onSelect
}) => {
  const icon = MODULE_ICONS[module];
  const label = MODULE_LABELS[module] || module;

  if (results.length === 0) return null;

  return (
    <Command.Group heading={label} className="overflow-hidden px-2 py-2">
      {results.map((result) => (
        <Command.Item
          key={`${result.type}-${result.id}`}
          value={String(result.id)}
          onSelect={() => onSelect(result)}
          className="flex items-start gap-3 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {result.title}
            </div>
            {result.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {result.description}
              </div>
            )}
          </div>
          {result.relevance > 0.8 && (
            <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
          )}
        </Command.Item>
      ))}
    </Command.Group>
  );
};

export default SearchResultGroup;
