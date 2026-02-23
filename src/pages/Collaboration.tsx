import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InformationRequests } from "@/components/InformationRequests";
import { SharedDocuments } from "@/components/SharedDocuments";
import { CategorizationApprovals } from "@/components/CategorizationApprovals";
import { CollaborationActivity } from "@/components/CollaborationActivity";
import { toast } from "sonner";

const mockActivities = [
  { id: "1", type: "comment" as const, user: "Sarah Johnson, CPA", message: "Reviewed your Q2 expenses — looks good!", timestamp: new Date("2024-11-06T14:30:00"), status: "Resolved" },
  { id: "2", type: "request" as const, user: "Sarah Johnson, CPA", message: "Requested missing mileage logs for Q3", timestamp: new Date("2024-11-05T09:15:00"), status: "Pending" },
  { id: "3", type: "document" as const, user: "You", message: "Uploaded 1099-NEC forms", timestamp: new Date("2024-11-04T16:00:00") },
  { id: "4", type: "approval" as const, user: "Sarah Johnson, CPA", message: "Approved re-categorization of Amazon purchase", timestamp: new Date("2024-11-03T11:45:00"), status: "Approved" },
];

export default function Collaboration() {
  const handleRespond = (id: string) => {
    toast.info(`Opening upload for request ${id}...`);
  };

  const handleComment = (docId: string) => {
    toast.info(`Opening comments for document ${docId}...`);
  };

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
        Collaboration
      </h1>
      <p className="text-muted-foreground mb-8">
        Work with your taxx preparer — respond to requests, share documents, and review categorizations.
      </p>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="documents">Shared Docs</TabsTrigger>
          <TabsTrigger value="categorization">Categorization</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <CollaborationActivity activities={mockActivities} />
        </TabsContent>

        <TabsContent value="requests">
          <InformationRequests onRespond={handleRespond} />
        </TabsContent>

        <TabsContent value="documents">
          <SharedDocuments onComment={handleComment} />
        </TabsContent>

        <TabsContent value="categorization">
          <CategorizationApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
