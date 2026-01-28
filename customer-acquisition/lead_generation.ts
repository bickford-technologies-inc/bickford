// Bun-native TypeScript script for lead generation
import { writeFile } from "bun";

interface Lead {
  company: string;
  industry: string;
  score: number;
  website: string;
}

const leads: Lead[] = [
  {
    company: "Lockheed Martin",
    industry: "Aerospace",
    score: 98,
    website: "https://lockheedmartin.com",
  },
  {
    company: "Goldman Sachs",
    industry: "Finance",
    score: 95,
    website: "https://goldmansachs.com",
  },
  {
    company: "Kaiser Permanente",
    industry: "Healthcare",
    score: 93,
    website: "https://kp.org",
  },
  {
    company: "Procter & Gamble",
    industry: "Consumer Goods",
    score: 92,
    website: "https://pg.com",
  },
  {
    company: "ExxonMobil",
    industry: "Energy",
    score: 91,
    website: "https://corporate.exxonmobil.com",
  },
  {
    company: "Boeing",
    industry: "Aerospace",
    score: 90,
    website: "https://boeing.com",
  },
  {
    company: "JPMorgan Chase",
    industry: "Finance",
    score: 89,
    website: "https://jpmorganchase.com",
  },
  {
    company: "CVS Health",
    industry: "Healthcare",
    score: 88,
    website: "https://cvshealth.com",
  },
  {
    company: "Caterpillar",
    industry: "Manufacturing",
    score: 87,
    website: "https://caterpillar.com",
  },
  {
    company: "General Electric",
    industry: "Conglomerate",
    score: 86,
    website: "https://ge.com",
  },
  // ...add more as needed
];

await writeFile(
  "./customer-acquisition/qualified_leads.json",
  JSON.stringify(leads, null, 2),
);
console.log("Leads generated and saved to qualified_leads.json");
