#!/bin/bash
if grep -R "@prisma/client" packages | grep -v "packages/db"; then
  echo "❌ Prisma client imported outside @bickford/db"
  exit 1
fi
