"use client";

/**
 * Timeline Component
 * Displays chronological events with selection support
 */

import { useState } from "react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  title?: string;
  decision?: string;
  type?: string;
  [key: string]: any;
}

interface TimelineProps {
  id: string;
  data: TimelineEvent[];
  onSelect?: (id: string) => void;
  props?: {
    title?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export function Timeline({ id, data, onSelect, props }: TimelineProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[props?.sortBy || "timestamp"];
    const bVal = b[props?.sortBy || "timestamp"];
    const comparison = aVal > bVal ? 1 : -1;
    return props?.sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSelect = (eventId: string) => {
    setSelectedId(eventId);
    onSelect?.(eventId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {props?.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {props.title}
        </h3>
      )}

      <div className="space-y-3">
        {sortedData.map((event) => (
          <div
            key={event.id}
            onClick={() => handleSelect(event.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedId === event.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {event.decision && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        event.decision === "ALLOW"
                          ? "bg-green-100 text-green-800"
                          : event.decision === "DENY"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.decision}
                    </span>
                  )}
                  {event.type && (
                    <span className="text-sm font-medium text-gray-700">
                      {event.type}
                    </span>
                  )}
                </div>
                {event.title && (
                  <p className="text-sm text-gray-600 mt-1">{event.title}</p>
                )}
              </div>
              <div className="text-xs text-gray-500 ml-4">
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events to display
        </div>
      )}
    </div>
  );
}
