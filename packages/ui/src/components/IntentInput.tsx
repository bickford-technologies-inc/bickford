import React from "react";

/**
 * IntentInput - User intent input component
 */
export function IntentInput() {
  return (
    <div>
      <textarea
        placeholder="Enter your intent..."
        style={{ width: "100%", minHeight: "100px" }}
      />
      <button>Submit</button>
    </div>
  );
}
