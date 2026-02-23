import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bitcoin, TrendingUp, TrendingDown, ArrowUpDown, Upload, DollarSign } from "lucide-react";

const mockHoldings = [
  { asset: "Bitcoin (BTC)", quantity: 1.25, costBasis: 42500, currentValue: 78125, gainLoss: 35625 },
  { asset: "Ethereum (ETH)", quantity: 12.5, costBasis: 22500, currentValue: 31250, gainLoss: 8750 },
  { asset: "Solana (SOL)", quantity: 150, costBasis: 9000, currentValue: 18750, gainLoss: 9750 },
  { asset: "Cardano (ADA)", quantity: 5000, costBasis: 3500, currentValue: 2750, gainLoss: -750 },
];

const mockTransactions = [
  { date: "2026-01-15", type: "Buy", asset: "BTC", amount: 0.5, price: 62500, total: 31250, taxEvent: false },
  { date: "2026-01-20", type: "Sell", asset: "ETH", amount: 3.0, price: 2450, total: 7350, taxEvent: true },
  { date: "2026-02-01", type: "Swap", asset: "SOL → USDC", amount: 50, price: 125, total: 6250, taxEvent: true },
  { date: "2026-02-10", type: "Staking Reward", asset: "ETH", amount: 0.05, price: 2500, total: 125, taxEvent: true },
  { date: "2026-02-18", type: "Buy", asset: "BTC", amount: 0.25, price: 64000, total: 16000, taxEvent: false },
];

export default function CryptoTaxes() {
  const [tab, setTab] = useState("holdings");

  const totalCostBasis = mockHoldings.reduce((s, h) => s + h.costBasis, 0);
  const totalValue = mockHoldings.reduce((s, h) => s + h.currentValue, 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const taxableEvents = mockTransactions.filter((t) => t.taxEvent).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Taxes</h1>
          <p className="text-muted-foreground">Track crypto holdings, gains/losses, and taxable events.</p>
        </div>
        <Button variant="gold">
          <Upload className="w-4 h-4 mr-2" /> Import Transactions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bitcoin className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">${totalCostBasis.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Cost Basis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {totalGainLoss >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive" />
              )}
              <div>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Unrealized Gain/Loss</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ArrowUpDown className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{taxableEvents}</p>
                <p className="text-xs text-muted-foreground">Taxable Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Your crypto portfolio with cost basis and unrealized gains.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Cost Basis</TableHead>
                    <TableHead className="text-right">Current Value</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockHoldings.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{h.asset}</TableCell>
                      <TableCell className="text-right">{h.quantity}</TableCell>
                      <TableCell className="text-right">${h.costBasis.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${h.currentValue.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${h.gainLoss >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {h.gainLoss >= 0 ? "+" : ""}${h.gainLoss.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All crypto transactions including taxable events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Tax Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === "Sell" ? "destructive" : t.type === "Buy" ? "default" : "secondary"}>
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{t.asset}</TableCell>
                      <TableCell className="text-right">{t.amount}</TableCell>
                      <TableCell className="text-right">${t.total.toLocaleString()}</TableCell>
                      <TableCell>
                        {t.taxEvent ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">Taxable</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
