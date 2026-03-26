import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-[1.5rem] bg-white/90 dark:bg-slate-900/90 p-1 shadow-sm h-14 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'rounded-[1.2rem] p-3 transition-all duration-300 flex items-center justify-center',
          view === 'grid'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 scale-105'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
        title="Vue Grille"
      >
        <Grid3X3 className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'rounded-[1.2rem] p-3 transition-all duration-300 flex items-center justify-center',
          view === 'list'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 scale-105'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
        title="Vue Liste"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}
