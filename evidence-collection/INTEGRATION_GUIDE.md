# Bickford Evidence Collection Integration Guide

## Overview

This guide explains how to integrate the Bickford usage tracker into your production workflow to collect evidence for compliance and ROI reporting.

## Steps

1. Import and run `usage_tracker.ts` in your production environment.
2. All API calls and key actions will be logged to `production_usage.jsonl`.
3. Use the output for compliance, ROI calculation, and reporting.

## Example Usage Event

```
{"timestamp":"2026-01-28T00:00:00Z","userId":"demo-user-1","action":"api_call","details":{"endpoint":"/v1/decision","durationMs":120}}
```

## Support

Contact the Bickford team for integration support.
