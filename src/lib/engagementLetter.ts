// Engagement letter scope template. When this string changes, the hash changes
// and clients are automatically re-prompted to acknowledge updated terms.

export const ENGAGEMENT_SCOPE = {
  version: "2026.1",
  title: "SmartBooks Taxx Preparation Engagement",
  effectiveYear: 2026,
  sections: [
    {
      heading: "Scope of Services",
      body: "Your preparer will (1) review documents and transactions you upload, (2) prepare a draft Federal Form 1040 and applicable schedules (Schedule C, SE, D, and 8949 where relevant), (3) review the draft with you, and (4) electronically file your return upon your authorization.",
    },
    {
      heading: "What Is Not Included",
      body: "This engagement does not include audit representation (available as a separate Audit Defense add-on), full-service bookkeeping outside of taxx-related categorization, legal advice, financial planning, or state and local return preparation unless explicitly added in writing.",
    },
    {
      heading: "Your Responsibilities",
      body: "You agree to provide complete and accurate records, retain source documentation for at least seven years, review the draft return for accuracy before authorizing e-file, and notify us promptly of any IRS or state correspondence.",
    },
    {
      heading: "Preparer Responsibilities",
      body: "Your preparer will exercise due diligence under IRS Circular 230, sign the return with their PTIN, keep your information confidential, and use reasonable care in applying current taxx law to the facts you provide.",
    },
    {
      heading: "Fees and Payment",
      body: "Fees are quoted in your plan or in a separate fee schedule. The draft Return Preview and ongoing document review are included in your subscription. E-file and any add-on services are billed as agreed before work begins.",
    },
    {
      heading: "Termination",
      body: "Either party may terminate this engagement in writing at any time. Fees for work already performed remain due.",
    },
  ],
};

// Stable JSON serialization for hashing.
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + stableStringify((value as Record<string, unknown>)[k]))
      .join(",") +
    "}"
  );
}

export async function getEngagementVersionHash(): Promise<string> {
  const text = stableStringify(ENGAGEMENT_SCOPE);
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
