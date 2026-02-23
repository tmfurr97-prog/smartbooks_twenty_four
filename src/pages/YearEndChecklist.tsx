import React, { useState } from 'react';
import ChecklistItem from '@/components/ChecklistItem';
import { Progress } from '@/components/ui/progress';

export default function YearEndChecklistPage() {
  const [items, setItems] = useState([
    { id: 1, title: 'Review all uploaded documents', description: 'Verify all receipts and statements are accurate', completed: true },
    { id: 2, title: 'Categorize expenses', description: 'Ensure all expenses are properly categorized', completed: true },
    { id: 3, title: 'Check medical expenses', description: 'Review healthcare and medical deductions', completed: true },
    { id: 4, title: 'Verify charitable donations', description: 'Confirm all donation receipts are uploaded', completed: false },
    { id: 5, title: 'Review business expenses', description: 'Check home office and business deductions', completed: false },
    { id: 6, title: 'Confirm education expenses', description: 'Verify tuition and student loan interest', completed: false },
    { id: 7, title: 'Check retirement contributions', description: 'Review IRA and 401(k) contributions', completed: false },
    { id: 8, title: 'Verify investment income', description: 'Ensure all investment documents are included', completed: false },
    { id: 9, title: 'Review state tax documents', description: 'Check state-specific deductions', completed: false },
    { id: 10, title: 'Final accuracy check', description: 'Review all data for accuracy before lock', completed: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Year-End Checklist</h1>
      <p className="text-muted-foreground mb-8">Complete all items before year-end to ensure your taxx documents are ready.</p>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">Progress</span>
          <span className="text-sm font-semibold text-accent">{completedCount}/{items.length} Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            title={item.title}
            description={item.description}
            completed={item.completed}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Year-End Lock:</strong> Data entry closes December 31. Complete verification before the deadline (optional, no fine for skipping).
        </p>
      </div>
    </div>
  );
}
