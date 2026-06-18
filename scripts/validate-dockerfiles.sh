#!/bin/bash
# Validate all Dockerfiles for common build errors

echo "🔍 Validating all Dockerfiles..."
echo ""

ERRORS=0
WARNINGS=0

# Check each service Dockerfile
for dockerfile in services/*/Dockerfile; do
  service=$(dirname "$dockerfile" | sed 's|services/||')

  echo -n "Checking $service... "

  # Check for npm install without dev when build is needed
  if grep -q "npm run build" "$dockerfile" 2>/dev/null; then
    if grep -q "npm install.*--omit=dev" "$dockerfile" && ! grep -q "npm install.*--legacy-peer-deps" "$dockerfile" | head -1; then
      echo "❌ ERROR: Has build step but installs with --omit=dev (missing TypeScript)"
      ((ERRORS++))
      continue
    fi
  fi

  # Check for proper working directory
  if ! grep -q "WORKDIR /usr/src/app" "$dockerfile"; then
    echo "⚠ WARNING: Non-standard WORKDIR"
    ((WARNINGS++))
    continue
  fi

  # Check for PORT exposure
  if ! grep -q "EXPOSE 5000" "$dockerfile"; then
    echo "⚠ WARNING: Not exposing port 5000"
    ((WARNINGS++))
    continue
  fi

  # Check for CMD
  if ! grep -q "^CMD" "$dockerfile"; then
    echo "❌ ERROR: Missing CMD"
    ((ERRORS++))
    continue
  fi

  echo "✅"
done

echo ""
echo "Results: $ERRORS errors, $WARNINGS warnings"
[ $ERRORS -eq 0 ] && echo "✅ All Dockerfiles valid!" && exit 0
echo "❌ Fix errors above before deploying"
exit 1
