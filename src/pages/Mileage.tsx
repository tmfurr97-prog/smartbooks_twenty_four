import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation, Plus, Trash2, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function Mileage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Trip recorder state
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tripType, setTripType] = useState('business');
  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');

  // Vehicle expense state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseType, setExpenseType] = useState('gas');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');

  const { data: trips = [] } = useQuery({
    queryKey: ['mileage_trips'],
    queryFn: async () => {
      const { data } = await supabase.from('mileage_trips').select('*').order('trip_date', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['vehicle_expenses'],
    queryFn: async () => {
      const { data } = await supabase.from('vehicle_expenses').select('*').order('expense_date', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const addTrip = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('mileage_trips').insert({
        user_id: user.id, trip_date: tripDate, start_location: startLocation, end_location: endLocation,
        start_lat: startCoords?.lat, start_lng: startCoords?.lng, distance_miles: parseFloat(distance),
        purpose, trip_type: tripType, is_round_trip: isRoundTrip, notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mileage_trips'] });
      setStartLocation(''); setEndLocation(''); setDistance(''); setPurpose(''); setNotes('');
      toast({ title: 'Trip recorded' });
    },
  });

  const addExpense = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('vehicle_expenses').insert({
        user_id: user.id, expense_date: expenseDate, expense_type: expenseType,
        amount: parseFloat(amount), vendor, description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle_expenses'] });
      setAmount(''); setVendor(''); setDescription(''); setShowExpenseForm(false);
      toast({ title: 'Expense saved' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicle_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicle_expenses'] }),
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setStartCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast({ title: 'Location captured' });
      });
    }
  };

  const totalMiles = trips.reduce((sum: number, t: any) => sum + parseFloat(t.distance_miles || 0), 0);
  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Mileage & Vehicle</h1>
      <p className="text-muted-foreground mb-8">Track trips and vehicle expenses for taxx deductions.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Miles</p>
          <p className="text-3xl font-bold text-foreground">{totalMiles.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">{trips.length} trips recorded</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Vehicle Expenses</p>
          <p className="text-3xl font-bold text-foreground">${totalExpenses.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{expenses.length} expenses</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Recorder */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" />Record New Trip</h3>
          <form onSubmit={(e) => { e.preventDefault(); addTrip.mutate(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Trip Date</Label><Input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} required /></div>
              <div><Label>Trip Type</Label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="commute">Commute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Start Location</Label>
              <div className="flex gap-2">
                <Input value={startLocation} onChange={(e) => setStartLocation(e.target.value)} required />
                <Button type="button" size="icon" variant="outline" onClick={getCurrentLocation}><Navigation className="h-4 w-4" /></Button>
              </div>
            </div>
            <div><Label>End Location</Label><Input value={endLocation} onChange={(e) => setEndLocation(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Distance (miles)</Label><Input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} required /></div>
              <div className="flex items-end"><label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} />Round Trip
              </label></div>
            </div>
            <div><Label>Purpose</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Client meeting, site visit, etc." required /></div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button type="submit" disabled={addTrip.isPending} className="w-full">Record Trip</Button>
          </form>
        </Card>

        {/* Vehicle Expenses */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div><h3 className="font-semibold text-foreground flex items-center gap-2"><Car className="h-5 w-5" />Vehicle Expenses</h3>
                <p className="text-sm text-muted-foreground">Total: ${totalExpenses.toFixed(2)}</p>
              </div>
              <Button onClick={() => setShowExpenseForm(!showExpenseForm)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
            </div>
            {showExpenseForm && (
              <form onSubmit={(e) => { e.preventDefault(); addExpense.mutate(); }} className="space-y-3 mb-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required /></div>
                  <div><Label>Type</Label>
                    <Select value={expenseType} onValueChange={setExpenseType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gas">Gas</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="repairs">Repairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Amount</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
                  <div><Label>Vendor</Label><Input value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
                </div>
                <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                <Button type="submit" disabled={addExpense.isPending} className="w-full">Save Expense</Button>
              </form>
            )}
          </Card>
          <div className="space-y-2">
            {expenses.map((expense: any) => (
              <Card key={expense.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-foreground">{expense.expense_date} - {expense.expense_type}</div>
                  <div className="text-sm text-muted-foreground">{expense.vendor}{expense.description && ` - ${expense.description}`}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">${parseFloat(expense.amount).toFixed(2)}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteExpense.mutate(expense.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
