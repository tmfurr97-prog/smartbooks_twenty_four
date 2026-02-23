import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Shield, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CollaborationActivity } from '@/components/CollaborationActivity';
import { SharedDocuments } from '@/components/SharedDocuments';
import { InformationRequests } from '@/components/InformationRequests';
import { CategorizationApprovals } from '@/components/CategorizationApprovals';

export default function Collaboration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState('');

  const activities = [
    { id: '1', type: 'comment' as const, user: 'Sarah Johnson, CPA', message: 'Reviewed Q3 expenses - looking good!', timestamp: new Date('2024-11-05T10:30:00') },
    { id: '2', type: 'request' as const, user: 'Sarah Johnson, CPA', message: 'Requested mileage logs for July-September', timestamp: new Date('2024-11-04T14:20:00'), status: 'pending' },
    { id: '3', type: 'approval' as const, user: 'You', message: 'Approved categorization change for Amazon purchase', timestamp: new Date('2024-11-03T09:15:00'), status: 'approved' },
  ];

  const { data: professionals = [] } = useQuery({
    queryKey: ['tax_professional_access'],
    queryFn: async () => {
      const { data } = await supabase.from('tax_professional_access').select('*');
      return data || [];
    },
    enabled: !!user,
  });

  const grantAccess = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('tax_professional_access').insert({
        user_id: user.id,
        professional_email: formData.get('email') as string,
        professional_name: formData.get('name') as string,
        access_level: formData.get('access_level') as string || 'view',
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Access granted successfully' });
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ['tax_professional_access'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Collaboration</h1>
          <p className="text-muted-foreground mt-1">Securely share documents and collaborate with your CPA or taxx preparer</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" />Invite Professional</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Tax Professional</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); grantAccess.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Name</Label><Input name="name" required placeholder="John Smith, CPA" /></div>
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Access Level</Label>
                <Select name="access_level" defaultValue="view">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">View & Comment</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={grantAccess.isPending}>Send Invitation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {professionals.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Active Collaborators</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {professionals.map((prof: any) => (
              <div key={prof.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">{prof.professional_name}</p>
                    <p className="text-sm text-muted-foreground">{prof.professional_email}</p>
                  </div>
                </div>
                <Badge>{prof.access_level}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-6"><CollaborationActivity activities={activities} /></TabsContent>
        <TabsContent value="documents" className="mt-6">
          <SharedDocuments onComment={(id) => { setSelectedDoc(id); setShowCommentDialog(true); }} />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <InformationRequests onRespond={() => toast({ title: 'Upload dialog would open here' })} />
        </TabsContent>
        <TabsContent value="approvals" className="mt-6"><CategorizationApprovals /></TabsContent>
      </Tabs>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Comment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Type your comment or question..." rows={4} />
            <Button className="w-full" onClick={() => { toast({ title: 'Comment added' }); setShowCommentDialog(false); }}>
              <MessageSquare className="h-4 w-4 mr-2" />Post Comment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
