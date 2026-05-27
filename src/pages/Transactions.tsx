import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TransactionFilters } from '@/components/TransactionFilters';
import { CategorySuggestions } from '@/components/CategorySuggestions';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TAX_CATEGORIES = [
  'Office Supplies', 'Travel', 'Meals & Entertainment', 'Vehicle',
  'Professional Services', 'Advertising', 'Insurance', 'Utilities',
  'Education', 'Home Office', 'Charitable', 'Medical', 'Other'
];

export default function Transactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: async () => {
      let query = supabase.from('transactions').select('*');
      if (filter === 'needs_review') query = query.eq('needs_review', true);
      else if (filter === 'deductible') query = query.eq('is_tax_deductible', true);
      const { data } = await query.order('date', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Database['public']['Tables']['transactions']['Update']> }) => {
      const { error } = await supabase.from('transactions').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction updated' });
    },
  });

  const handleFileUpload = async (transactionId: string, file: File) => {
    if (!user) return;
    const fileName = `${user.id}/${transactionId}-${file.name}`;
    const { data, error } = await supabase.storage.from('receipts').upload(fileName, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      updateMutation.mutate({ id: transactionId, updates: { receipt_url: urlData.publicUrl } });
    }
  };

  const filtered = transactions.filter((t: any) => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || t.tax_category === categoryFilter;
    const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
    return matchesSearch && matchesCategory && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm(''); setCategoryFilter('All Categories'); setStartDate(''); setEndDate(''); setFilter('all');
  };

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Transactions</h1>
      <p className="text-muted-foreground mb-8">Review, categorize, and manage your transactions for taxx preparation.</p>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Review</CardTitle>
          <TransactionFilters
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            filter={filter} onFilterChange={setFilter}
            categoryFilter={categoryFilter} onCategoryFilterChange={setCategoryFilter}
            startDate={startDate} onStartDateChange={setStartDate}
            endDate={endDate} onEndDateChange={setEndDate}
            onClearFilters={clearFilters}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              filtered.map((transaction: any) => (
                <div key={transaction.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{transaction.name}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.merchant_name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">${Math.abs(transaction.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>

                  <CategorySuggestions
                    transactionName={transaction.name}
                    merchantName={transaction.merchant_name || ''}
                    amount={transaction.amount}
                    onSelectCategory={(category) =>
                      updateMutation.mutate({ id: transaction.id, updates: { tax_category: category, is_tax_deductible: true } })
                    }
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <Select
                      value={transaction.tax_category || ''}
                      onValueChange={(value) => updateMutation.mutate({ id: transaction.id, updates: { tax_category: value } })}
                    >
                      <SelectTrigger><SelectValue placeholder="Tax Category" /></SelectTrigger>
                      <SelectContent>
                        {TAX_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={transaction.is_tax_deductible}
                        onCheckedChange={(checked) =>
                          updateMutation.mutate({ id: transaction.id, updates: { is_tax_deductible: !!checked } })
                        }
                      />
                      <label className="text-sm text-foreground">Tax Deductible</label>
                    </div>

                    <div className="flex gap-2">
                      {transaction.receipt_url ? (
                        <Badge variant="secondary"><FileText className="mr-1 h-3 w-3" />Receipt</Badge>
                      ) : (
                        <label className="cursor-pointer">
                          <Input type="file" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(transaction.id, file);
                          }} />
                          <Button size="sm" variant="outline" asChild><span><Upload className="h-4 w-4" /></span></Button>
                        </label>
                      )}
                      {transaction.needs_review && (
                        <Button size="sm" onClick={() => updateMutation.mutate({ id: transaction.id, updates: { needs_review: false } })}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <Input
                    placeholder="Add notes..."
                    value={transaction.notes || ''}
                    onChange={(e) => updateMutation.mutate({ id: transaction.id, updates: { notes: e.target.value } })}
                    className="mt-3"
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
