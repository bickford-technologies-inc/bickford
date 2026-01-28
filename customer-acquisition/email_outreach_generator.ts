// Bun-native TypeScript script for generating personalized emails
import { writeFile } from "bun";
import { readFile } from "bun";

interface Lead {
  company: string;
  industry: string;
  score: number;
  website: string;
}

const leads: Lead[] = JSON.parse(
  await readFile("./customer-acquisition/qualified_leads.json").text(),
);

const emails = leads.map((lead, i) => {
  return {
    to: `${lead.company} Decision Maker`,
    email: `info@${lead.website.replace("https://", "").replace("www.", "")}`,
    subject: `Unlock Compliance Moat for ${lead.company}`,
    body: `Hi ${lead.company} Team,\n\nBickford's OPTR ledger delivers cryptographic compliance and saves 100+ hours for ${lead.industry} leaders. Can we schedule a quick call to show how you can achieve audit-proof automation?\n\nBest,\nBickford Team`,
  };
});

const csv = [
  "to,email,subject,body",
  ...emails.map(
    (e) =>
      `"${e.to}","${e.email}","${e.subject}","${e.body.replace(/\n/g, " ")}"`,
  ),
].join("\n");

await writeFile("./customer-acquisition/emails_to_send.csv", csv);
console.log("Personalized emails generated and saved to emails_to_send.csv");
