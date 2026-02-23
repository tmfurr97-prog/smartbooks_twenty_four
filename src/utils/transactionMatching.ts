export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  description: string;
  source: string;
}

export interface Receipt {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category: string;
}

export interface MatchedPair {
  transaction: Transaction;
  receipt: Receipt;
  confidence: number;
}

export function matchTransactionsWithReceipts(
  transactions: Transaction[],
  receipts: Receipt[]
): { matched: MatchedPair[]; unmatchedTransactions: Transaction[]; unmatchedReceipts: Receipt[] } {
  const matched: MatchedPair[] = [];
  const usedReceipts = new Set<string>();
  const matchedTransactionIds = new Set<string>();

  for (const transaction of transactions) {
    for (const receipt of receipts) {
      if (usedReceipts.has(receipt.id)) continue;
      
      const amountMatch = Math.abs(transaction.amount - receipt.amount) < 0.01;
      const merchantMatch = transaction.merchant.toLowerCase() === receipt.merchant.toLowerCase();
      const dateMatch = transaction.date === receipt.date;

      if (amountMatch && (merchantMatch || dateMatch)) {
        const confidence = (amountMatch ? 40 : 0) + (merchantMatch ? 40 : 0) + (dateMatch ? 20 : 0);
        matched.push({ transaction, receipt, confidence });
        usedReceipts.add(receipt.id);
        matchedTransactionIds.add(transaction.id);
        break;
      }
    }
  }

  return {
    matched,
    unmatchedTransactions: transactions.filter(t => !matchedTransactionIds.has(t.id)),
    unmatchedReceipts: receipts.filter(r => !usedReceipts.has(r.id)),
  };
}
