import { ArrowUpDown, Calendar, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Separator } from './separator';

export type SortField = 'date' | 'size';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
  {
    field: 'date' as SortField,
    label: 'Date',
    icon: Calendar,
    orders: [
      { order: 'desc' as SortOrder, label: 'Newest first' },
      { order: 'asc' as SortOrder, label: 'Oldest first' },
    ],
  },
  {
    field: 'size' as SortField,
    label: 'Size',
    icon: Clock,
    orders: [
      { order: 'desc' as SortOrder, label: 'Largest first' },
      { order: 'asc' as SortOrder, label: 'Smallest first' },
    ],
  },
];

export function SortButton({ currentSort, onSortChange }: SortButtonProps) {
  const getCurrentLabel = () => {
    const option = sortOptions.find(opt => opt.field === currentSort.field);
    const orderConfig = option?.orders.find(ord => ord.order === currentSort.order);
    return `${option?.label}: ${orderConfig?.label}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:bg-gray-800/50 dark:border-gray-700/30 dark:hover:bg-gray-800/70"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
          <div className="space-y-1 mb-3">
            <h4 className="font-medium leading-none">Sort photos by</h4>
            <p className="text-sm text-muted-foreground">
              Choose how to organize your photos
            </p>
          </div>
          
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <div key={option.field}>
                <div className="flex items-center gap-2 mb-2">
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                <div className="space-y-1 ml-6">
                  {option.orders.map((orderConfig) => (
                    <button
                      key={`${option.field}-${orderConfig.order}`}
                      onClick={() => onSortChange({ field: option.field, order: orderConfig.order })}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        currentSort.field === option.field && currentSort.order === orderConfig.order
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span>{orderConfig.label}</span>
                      {orderConfig.order === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  ))}
                </div>
                {option.field === 'date' && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Current: {getCurrentLabel()}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
} 