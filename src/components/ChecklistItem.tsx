import { CheckCircle, Circle } from 'lucide-react';

interface ChecklistItemProps {
  title: string;
  description: string;
  completed: boolean;
  onToggle: () => void;
}

export default function ChecklistItem({ title, description, completed, onToggle }: ChecklistItemProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
        completed ? 'bg-muted/50 border-border' : 'bg-card border-border hover:border-accent'
      }`}
      onClick={onToggle}
    >
      {completed ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      )}
      <div>
        <p className={`font-medium ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
