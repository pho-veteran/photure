import { Grid3x3, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export type CategoryType = 'date' | 'month' | 'year';

interface CategoryButtonProps {
  currentCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const categoryOptions = [
  {
    type: 'date' as CategoryType,
    label: 'By Date',
    description: 'Group photos by specific dates',
    icon: CalendarDays,
  },
  {
    type: 'month' as CategoryType,
    label: 'By Month',
    description: 'Group photos by months',
    icon: CalendarRange,
  },
  {
    type: 'year' as CategoryType,
    label: 'By Year',
    description: 'Group photos by years',
    icon: Calendar,
  },
];

export function CategoryButton({ currentCategory, onCategoryChange }: CategoryButtonProps) {
  const getCurrentLabel = () => {
    const option = categoryOptions.find(opt => opt.type === currentCategory);
    return option?.label || 'By Date';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 dark:bg-gray-800/50 dark:border-gray-700/30 dark:hover:bg-gray-800/70"
        >
          <Grid3x3 className="h-4 w-4" />
          <span className="hidden sm:inline">Group</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-4">
          <div className="space-y-1 mb-4">
            <h4 className="font-medium leading-none">Group photos by</h4>
            <p className="text-sm text-muted-foreground">
              Choose how to organize your photos into sections
            </p>
          </div>
          
          <div className="space-y-2">
            {categoryOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onCategoryChange(option.type)}
                className={`w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors ${
                  currentCategory === option.type
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <option.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="font-medium">{option.label}</div>
                  <div className={`text-sm ${
                    currentCategory === option.type
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground'
                  }`}>
                    {option.description}
                  </div>
                </div>
                {currentCategory === option.type && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
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