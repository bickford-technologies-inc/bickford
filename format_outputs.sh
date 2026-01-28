#!/bin/bash
# Format all TypeScript files in outputs/ using Bun's formatter
find outputs/ -type f -name '*.ts' | xargs bun format
