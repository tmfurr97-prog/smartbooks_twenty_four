export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "maximize-deductions-2026",
    title: "10 Ways to Maximize Your Tax Deductions in 2026",
    excerpt: "Learn the top strategies for reducing your tax burden this year with these expert-approved tips.",
    content: `## Introduction\n\nTax season doesn't have to be stressful. With the right strategies, you can legally minimize what you owe.\n\n## 1. Track Every Business Expense\n\nKeep detailed records of all business-related purchases. SmartBooks makes this automatic with AI-powered receipt scanning.\n\n## 2. Don't Forget Home Office Deductions\n\nIf you work from home, you may qualify for the home office deduction using either the simplified or regular method.\n\n## 3. Maximize Retirement Contributions\n\nContributions to SEP-IRAs, Solo 401(k)s, and traditional IRAs can significantly reduce your taxable income.\n\n## 4. Track Your Mileage\n\nBusiness mileage at the IRS standard rate adds up quickly. Use our built-in mileage tracker to log every trip.\n\n## 5. Charitable Contributions\n\nDonations to qualified organizations are deductible. Keep receipts for all contributions over $250.`,
    category: "tax-tips",
    author: "SmartBooks Team",
    date: "Feb 15, 2026",
    readTime: "5 min read",
    image: "/placeholder.svg",
  },
  {
    slug: "freelancer-quarterly-taxes",
    title: "A Freelancer's Guide to Quarterly Estimated Taxes",
    excerpt: "Stay ahead of your tax obligations with this comprehensive guide to quarterly payments.",
    content: `## Why Quarterly Taxes Matter\n\nAs a freelancer, you're responsible for paying estimated taxes four times a year. Missing deadlines means penalties.\n\n## The Deadlines\n\n- Q1: April 15\n- Q2: June 15\n- Q3: September 15\n- Q4: January 15 (next year)\n\n## How to Calculate\n\nEstimate your annual income, subtract deductions, and apply your tax rate. Divide by 4 for your quarterly payment.\n\n## Use SmartBooks to Automate\n\nOur quarterly tax calculator does the math for you and sends reminders before each deadline.`,
    category: "tax-tips",
    author: "SmartBooks Team",
    date: "Jan 28, 2026",
    readTime: "4 min read",
    image: "/placeholder.svg",
  },
  {
    slug: "new-ai-features-2026",
    title: "New AI Features: Smarter Document Processing",
    excerpt: "Our latest AI update brings faster receipt scanning, better categorization, and intelligent tax suggestions.",
    content: `## What's New\n\nWe've upgraded our AI engine to provide even smarter document processing and tax insights.\n\n## Faster Receipt Scanning\n\nOur new OCR engine processes receipts 3x faster with 99% accuracy.\n\n## Better Categorization\n\nAI now uses IRS Schedule C categories for more accurate expense classification.\n\n## Smart Tax Suggestions\n\nGet proactive suggestions for deductions you might be missing based on your spending patterns.`,
    category: "platform-updates",
    author: "SmartBooks Engineering",
    date: "Feb 1, 2026",
    readTime: "3 min read",
    image: "/placeholder.svg",
  },
  {
    slug: "small-business-financial-planning",
    title: "Financial Planning Tips for Small Business Owners",
    excerpt: "Build a stronger financial foundation with these practical tips for managing your business finances.",
    content: `## Separate Business and Personal\n\nAlways keep business and personal finances separate. Use a dedicated business bank account and credit card.\n\n## Build an Emergency Fund\n\nAim for 3-6 months of operating expenses in a business savings account.\n\n## Review Financials Monthly\n\nDon't wait until tax season. Review your income, expenses, and profit monthly to stay on track.`,
    category: "financial-advice",
    author: "SmartBooks Team",
    date: "Jan 10, 2026",
    readTime: "4 min read",
    image: "/placeholder.svg",
  },
];
