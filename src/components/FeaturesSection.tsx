import { Shield, Upload, MessageSquare, Bot, Video, FolderLock } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Secure Document Uploads",
    description: "Upload W-2s, 1099s, receipts, IDs, and more through our encrypted portal.",
  },
  {
    icon: MessageSquare,
    title: "Real‑Time Messaging",
    description: "Chat directly with your tax preparer anytime—get updates and answers fast.",
  },
  {
    icon: Bot,
    title: "AI Q&A Assistant",
    description: "Get instant answers to common tax questions powered by AI.",
  },
  {
    icon: Video,
    title: "Video Meetings",
    description: "Schedule optional face-to-face video appointments with your preparer.",
  },
  {
    icon: FolderLock,
    title: "Year‑Round Vault",
    description: "Store and organize your financial documents securely all year long.",
  },
  {
    icon: Shield,
    title: "Bank‑Level Security",
    description: "End‑to‑end encryption and AES‑256 storage keep your data safe.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need,{" "}
            <span className="text-gradient-gold">All in One Place</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From uploading your documents to filing your return — SmartBooks keeps you organized,
            connected, and confident.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-xl bg-card border border-border hover:border-gold/40 hover:shadow-gold transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-gold flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
