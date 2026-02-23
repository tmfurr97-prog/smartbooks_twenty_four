import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2Off } from 'lucide-react';
import type { MatchedPair } from '@/utils/transactionMatching';

interface MatchedPairCardProps {
  pair: MatchedPair;
  onUnmatch: (transactionId: string) => void;
}

export function MatchedPairCard({ pair, onUnmatch }: MatchedPairCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pair.transaction.source}</Badge>
            <Badge className="bg-green-100 text-green-800">Matched ({pair.confidence}%)</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Transaction</p>
              <p className="font-medium">{pair.transaction.merchant}</p>
              <p className="text-sm text-muted-foreground">{pair.transaction.description}</p>
              <p className="text-sm">${pair.transaction.amount.toFixed(2)} · {pair.transaction.date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receipt</p>
              <p className="font-medium">{pair.receipt.merchant}</p>
              <p className="text-sm text-muted-foreground">{pair.receipt.category}</p>
              <p className="text-sm">${pair.receipt.amount.toFixed(2)} · {pair.receipt.date}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onUnmatch(pair.transaction.id)}>
          <Link2Off className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
