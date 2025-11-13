# Scripts Directory

## Ad Refresh Batch Update

### Usage

```bash
# Run from project root
node scripts/add-ad-refresh-batch.mjs
```

### What it does

Automatically applies the ad refresh pattern to all tool pages in `src/pages/tools/`:

1. **Adds import**: `import { useAdRefresh } from "@/hooks/useAdRefresh";`
2. **Adds hook call**: `const adRefreshKey = useAdRefresh(3);` at component start
3. **Adds prop**: `adRefreshKey={adRefreshKey}` to ToolLayout component

### Safety Features

- ✅ Skips files that already have `useAdRefresh`
- ✅ Skips files without `ToolLayout` component
- ✅ Only processes `.tsx` files
- ✅ Generates detailed report of all changes
- ✅ Lists errors for manual review

### Output

- Updates tool files in place
- Generates `scripts/ad-refresh-report.md` with detailed results

### Already Updated Tools

The script automatically skips these 20 tools that were manually updated:
- APITester, CodeBeautifier
- ImageCompressor, ImageResizer
- PDFMerger, PDFSplitter
- QRCodeGenerator, ColorPicker
- JSONFormatter, MarkdownPreview
- PasswordGenerator, WordCounter
- Base64Encoder, URLEncoder
- BMICalculator, TipCalculator
- CurrencyConverter, UnitConverter
- PercentageCalculator, LoremIpsumGenerator

### Manual Review Needed

After running the script:
1. Check `scripts/ad-refresh-report.md` for errors
2. Review files with errors manually
3. Test a few tools to ensure functionality works correctly
4. Commit changes

### Rollback

If needed, use git to revert changes:
```bash
git checkout src/pages/tools/
```
