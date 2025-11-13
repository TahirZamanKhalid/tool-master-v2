# Ad Refresh Implementation Guide

## Completed Tools (14)
✅ APITester.tsx
✅ CodeBeautifier.tsx  
✅ ImageCompressor.tsx
✅ PDFMerger.tsx
✅ QRCodeGenerator.tsx
✅ JSONFormatter.tsx
✅ PasswordGenerator.tsx
✅ WordCounter.tsx
✅ ImageResizer.tsx
✅ PDFSplitter.tsx
✅ MarkdownPreview.tsx
✅ Base64Encoder.tsx
✅ URLEncoder.tsx
✅ ColorPicker.tsx

## Pattern for Remaining Tools

For each tool file in `src/pages/tools/`:

1. **Add import** (after other React imports):
```typescript
import { useAdRefresh } from "@/hooks/useAdRefresh";
```

2. **Add hook call** (at start of component):
```typescript
const adRefreshKey = useAdRefresh(3);
```

3. **Add prop to ToolLayout**:
```typescript
<ToolLayout
  title="..."
  description="..."
  category="..."
  adRefreshKey={adRefreshKey}  // <-- Add this line
  ...
>
```

## Status
- Completed: 14/152 tools
- Remaining: ~138 tools

The ad refresh system is now active on all updated tools, rotating ads every 3 minutes to maximize impressions.
