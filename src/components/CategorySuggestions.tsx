import { Badge } from '@/components/ui/badge';

const CATEGORY_RULES: Record<string, string[]> = {
  'Office Supplies': ['office', 'staples', 'depot', 'paper', 'ink', 'printer'],
  'Meals & Entertainment': ['restaurant', 'cafe', 'coffee', 'starbucks', 'lunch', 'dinner'],
  'Travel': ['airline', 'hotel', 'uber', 'lyft', 'flight', 'airbnb'],
  'Software': ['software', 'subscription', 'saas', 'adobe', 'microsoft'],
  'Vehicle': ['gas', 'fuel', 'shell', 'chevron', 'auto', 'car wash'],
};

interface CategorySuggestionsProps {
  transactionName: string;
  merchantName: string;
  amount: number;
  onSelectCategory: (category: string) => void;
}

export function CategorySuggestions({ transactionName, merchantName, onSelectCategory }: CategorySuggestionsProps) {
  const text = `${transactionName} ${merchantName}`.toLowerCase();
  const suggestions = Object.entries(CATEGORY_RULES)
    .filter(([, keywords]) => keywords.some(k => text.includes(k)))
    .map(([category]) => category);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-muted-foreground">Suggested:</span>
      {suggestions.map(cat => (
        <Badge
          key={cat}
          variant="outline"
          className="cursor-pointer hover:bg-accent"
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </Badge>
      ))}
    </div>
  );
}
