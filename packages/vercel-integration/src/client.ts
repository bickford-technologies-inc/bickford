import { Vercel } from "@vercel/sdk";

if (!process.env.VERCEL_TOKEN) {
  throw new Error("VERCEL_TOKEN is required for Vercel integration execution");
}

export const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});
