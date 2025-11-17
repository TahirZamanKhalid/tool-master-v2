#!/bin/bash

# Script to remove all ad-related imports and usages from TypeScript/TSX files

find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Skip type definition files
  if [[ "$file" == *.d.ts ]]; then
    continue
  fi
  
  # Create a backup
  cp "$file" "$file.bak"
  
  # Remove ad component imports
  sed -i '/import.*AdSpace.*from/d' "$file"
  sed -i '/import.*LazyAdSpace.*from/d' "$file"
  sed -i '/import.*AdRow.*from/d' "$file"
  sed -i '/import.*SidebarAd.*from/d' "$file"
  sed -i '/import.*ContentAdBreak.*from/d' "$file"
  sed -i '/import.*AdWatchModal.*from/d' "$file"
  sed -i '/import.*GeneratingAdModal.*from/d' "$file"
  sed -i '/import.*PeriodicAdModal.*from/d' "$file"
  sed -i '/import.*ProcessingOverlay.*from/d' "$file"
  sed -i '/import.*useAdRefresh.*from/d' "$file"
  sed -i '/import.*usePeriodicAds.*from/d' "$file"
  sed -i '/import.*adSlotRotation.*from/d' "$file"
  sed -i '/import.*getDisplayAdSlot.*from/d' "$file"
  sed -i '/import.*getAdIndex.*from/d' "$file"
  
  echo "Processed: $file"
done

echo "✓ Import cleanup complete. Now manually remove JSX usage of ad components."
echo "Note: JSX cleanup requires more complex parsing and should be done carefully."
