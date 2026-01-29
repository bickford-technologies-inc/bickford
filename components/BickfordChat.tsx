import React, { useState } from "react";

interface Message {
  author: string;
  content: string;
  timestamp: string;
}

// Simulated Bickford AI response (replace with real API call for production)
async function getBickfordResponse(userMessage: string): Promise<string> {
  // Simple rule-based demo: echo, or basic canned responses
  if (
    userMessage.toLowerCase().includes("hello") ||
    userMessage.toLowerCase().includes("hi")
  ) {
    return "Hello! How can I help you with Bickford compliance or AI safety today?";
  }
  if (userMessage.toLowerCase().includes("compression")) {
    return "Bickford achieves 99.9%+ compression by deduplicating all redundant audit data and storing only unique cryptographic blocks.";
  }
  if (userMessage.toLowerCase().includes("ledger")) {
    return "Every decision is hash-chained in the ledger for full auditability. No mutation or reordering is possible.";
  }
  if (userMessage.toLowerCase().includes("optr")) {
    return "OPTR selects the optimal admissible policy with non-interference guarantees, minimizing time-to-value.";
  }
  return "Thank you for your message! A Bickford agent will follow up if you need advanced help.";
}

// (Component removed to disable chat box)
