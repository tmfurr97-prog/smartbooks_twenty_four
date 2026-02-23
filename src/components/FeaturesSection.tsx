import {
  Shield,
  Upload,
  MessageSquare,
  Bot,
  Video,
  FolderLock,
  Brain,
  ScanSearch,
  FileCheck,
  BellRing,
  ClipboardList,
  CalendarClock,
  BarChart3,
  Receipt,
  DollarSign,
  Tags,
  Stamp,
} from "lucide-react";

const featureGroups = [
  {
    heading: "Document Intelligence",
    accent: true,
    features: [
      {
        icon: Brain,
        title: "Auto‑Sorting",
        description: "AI categorizes your uploads (W-2, 1099, receipt) automatically.",
      },
      {
        icon: ScanSearch,
        title: "Auto‑Naming",
        description: "Smart file names so you never dig through 'IMG_4023' again.",
      },
      { icon: FileCheck, title: "Duplicate Detection", description: "Instantly flags files you've already uploaded." },
      {
        icon: BellRing,
        title: "Missing Doc Alerts",
        description: "Know exactly which documents are still needed before filing.",
      },
    ],
  },
  {
    heading: "AI Support",
    features: [
      { icon: Bot, title: "Q&A Assistant", description: "Get instant answers to common tax questions powered by AI." },
      {
        icon: ClipboardList,
        title: "Document Checklists",
        description: "Personalized checklists based on your tax situation.",
      },
      {
        icon: CalendarClock,
        title: "Year‑Round Reminders",
        description: "Timely nudges for estimated payments and deadlines.",
      },
      {
        icon: BarChart3,
        title: "End‑of‑Year AI Review",
        description: "AI scans your documents for errors and missed deductions.",
      },
    ],
  },
  {
    heading: "Real Communication",
    features: [
      {
        icon: MessageSquare,
        title: "Secure Messaging",
        description: "Chat directly with your tax preparer — encrypted end‑to‑end.",
      },
      { icon: Video, title: "Video Meetings", description: "Schedule optional face-to-face video appointments." },
      {
        icon: Stamp,
        title: "Notary Integration",
        description: "eSign and notarize documents without leaving the platform.",
      },
    ],
  },
  {
    heading: "Year‑Round Organization",
    features: [
      {
        icon: Receipt,
        title: "Receipt Storage",
        description: "Snap and store receipts all year — always ready at tax time.",
      },
      {
        icon: DollarSign,
        title: "Income Tracking",
        description: "Track freelance, rental, and side-gig income in one place.",
      },
      { icon: Tags, title: "Expense Categories", description: "Tag and sort expenses for cleaner deductions." },
      {
        icon: CalendarClock,
        title: "Quarterly Reminders",
        description: "Never miss an estimated tax payment deadline.",
      },
    ],
  },
  {
    heading: "Security & Storage",
    features: [
      {
        icon: Upload,
        title: "Secure Uploads",
        description: "Upload W-2s, 1099s, receipts, and IDs through our encrypted portal.",
      },
      {
        icon: FolderLock,
        title: "Year‑Round Vault",
        description: "Store and organize your financial documents securely all year.",
      },
      {
        icon: Shield,
        title: "Bank‑Level Security",
        description: "End‑to‑end encryption and AES‑256 storage keep your data safe.",
      },
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need, <span className="text-gradient-gold">In One Place</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From upload to filing — SmartBooks handles the heavy lifting with AI‑powered intelligence.
          </p>
        </div>

        <div className="space-y-20 max-w-6xl mx-auto">
          {featureGroups.map((group) => (
            <div key={group.heading}>
              <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-gradient-gold rounded-full" />
                {group.heading}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group relative p-6 rounded-xl bg-card border border-border hover:border-gold/40 hover:shadow-gold transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-lg bg-gradient-gold flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <h4 className="font-heading text-base font-semibold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
