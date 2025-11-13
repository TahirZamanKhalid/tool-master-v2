#!/usr/bin/env node

/**
 * Batch script to add ad refresh functionality to all tool pages
 * 
 * This script automatically applies the ad refresh pattern to all tools:
 * 1. Adds useAdRefresh import
 * 2. Adds adRefreshKey hook call in component
 * 3. Adds adRefreshKey prop to ToolLayout
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const TOOLS_DIR = './src/pages/tools';
const REPORT_FILE = './scripts/ad-refresh-report.md';

// Tools already updated (skip these)
const ALREADY_UPDATED = [
  'APITester.tsx',
  'CodeBeautifier.tsx',
  'ImageCompressor.tsx',
  'PDFMerger.tsx',
  'QRCodeGenerator.tsx',
  'JSONFormatter.tsx',
  'PasswordGenerator.tsx',
  'WordCounter.tsx',
  'ImageResizer.tsx',
  'PDFSplitter.tsx',
  'MarkdownPreview.tsx',
  'Base64Encoder.tsx',
  'URLEncoder.tsx',
  'ColorPicker.tsx',
  'BMICalculator.tsx',
  'TipCalculator.tsx',
  'CurrencyConverter.tsx',
  'UnitConverter.tsx',
  'PercentageCalculator.tsx',
  'LoremIpsumGenerator.tsx'
];

const stats = {
  total: 0,
  skipped: 0,
  updated: 0,
  errors: 0,
  files: []
};

function hasUseAdRefresh(content) {
  return content.includes('useAdRefresh');
}

function addImport(content) {
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && !lines[i].includes('useAdRefresh')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex === -1) return content;
  
  // Insert the import after the last import
  const importLine = 'import { useAdRefresh } from "@/hooks/useAdRefresh";';
  lines.splice(lastImportIndex + 1, 0, importLine);
  
  return lines.join('\n');
}

function addHookCall(content) {
  // Find the component function declaration
  // Pattern: const ComponentName = () => {
  const componentMatch = content.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{/);
  
  if (!componentMatch) {
    // Try alternate pattern: function ComponentName() {
    const funcMatch = content.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (!funcMatch) return { content, found: false };
    
    const lines = content.split('\n');
    const funcLine = lines.findIndex(line => line.includes(funcMatch[0]));
    
    if (funcLine !== -1) {
      const hookCall = '  const adRefreshKey = useAdRefresh(3);';
      lines.splice(funcLine + 1, 0, hookCall);
      return { content: lines.join('\n'), found: true };
    }
  } else {
    const lines = content.split('\n');
    const componentLine = lines.findIndex(line => line.includes(componentMatch[0]));
    
    if (componentLine !== -1) {
      const hookCall = '  const adRefreshKey = useAdRefresh(3);';
      lines.splice(componentLine + 1, 0, hookCall);
      return { content: lines.join('\n'), found: true };
    }
  }
  
  return { content, found: false };
}

function addPropToToolLayout(content) {
  // Find ToolLayout opening tag and add adRefreshKey prop
  // Handle both self-closing and multi-line patterns
  
  // Pattern 1: <ToolLayout ... >
  const toolLayoutRegex = /(<ToolLayout\s+[^>]*?)(>)/;
  
  if (toolLayoutRegex.test(content)) {
    // Check if adRefreshKey already exists
    if (content.includes('adRefreshKey={adRefreshKey}')) {
      return { content, found: true };
    }
    
    // Add the prop before the closing >
    const updated = content.replace(
      toolLayoutRegex,
      '$1\n      adRefreshKey={adRefreshKey}$2'
    );
    
    return { content: updated, found: true };
  }
  
  return { content, found: false };
}

function processFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Skip if already has useAdRefresh
    if (hasUseAdRefresh(content)) {
      stats.skipped++;
      stats.files.push({ file: filePath, status: 'skipped', reason: 'Already has useAdRefresh' });
      return;
    }
    
    // Skip if no ToolLayout
    if (!content.includes('ToolLayout')) {
      stats.skipped++;
      stats.files.push({ file: filePath, status: 'skipped', reason: 'No ToolLayout found' });
      return;
    }
    
    // Step 1: Add import
    content = addImport(content);
    modified = true;
    
    // Step 2: Add hook call
    const hookResult = addHookCall(content);
    if (!hookResult.found) {
      stats.errors++;
      stats.files.push({ file: filePath, status: 'error', reason: 'Could not find component function' });
      return;
    }
    content = hookResult.content;
    
    // Step 3: Add prop to ToolLayout
    const propResult = addPropToToolLayout(content);
    if (!propResult.found) {
      stats.errors++;
      stats.files.push({ file: filePath, status: 'error', reason: 'Could not find ToolLayout' });
      return;
    }
    content = propResult.content;
    
    // Write the updated content
    writeFileSync(filePath, content, 'utf-8');
    
    stats.updated++;
    stats.files.push({ file: filePath, status: 'updated', reason: 'Successfully added ad refresh' });
    
  } catch (error) {
    stats.errors++;
    stats.files.push({ file: filePath, status: 'error', reason: error.message });
  }
}

function generateReport() {
  let report = `# Ad Refresh Batch Update Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total files scanned:** ${stats.total}\n`;
  report += `- **Files updated:** ${stats.updated}\n`;
  report += `- **Files skipped:** ${stats.skipped}\n`;
  report += `- **Errors:** ${stats.errors}\n\n`;
  
  if (stats.updated > 0) {
    report += `## ✅ Successfully Updated (${stats.updated})\n\n`;
    stats.files
      .filter(f => f.status === 'updated')
      .forEach(f => {
        const fileName = f.file.split('/').pop();
        report += `- ${fileName}\n`;
      });
    report += `\n`;
  }
  
  if (stats.skipped > 0) {
    report += `## ⏭️ Skipped (${stats.skipped})\n\n`;
    stats.files
      .filter(f => f.status === 'skipped')
      .forEach(f => {
        const fileName = f.file.split('/').pop();
        report += `- ${fileName}: ${f.reason}\n`;
      });
    report += `\n`;
  }
  
  if (stats.errors > 0) {
    report += `## ❌ Errors (${stats.errors})\n\n`;
    stats.files
      .filter(f => f.status === 'error')
      .forEach(f => {
        const fileName = f.file.split('/').pop();
        report += `- ${fileName}: ${f.reason}\n`;
      });
    report += `\n`;
  }
  
  report += `## Pattern Applied\n\n`;
  report += `\`\`\`typescript\n`;
  report += `// 1. Import added\n`;
  report += `import { useAdRefresh } from "@/hooks/useAdRefresh";\n\n`;
  report += `// 2. Hook call added at component start\n`;
  report += `const ComponentName = () => {\n`;
  report += `  const adRefreshKey = useAdRefresh(3);\n`;
  report += `  // ... rest of component\n\n`;
  report += `// 3. Prop added to ToolLayout\n`;
  report += `<ToolLayout\n`;
  report += `  title="..."\n`;
  report += `  adRefreshKey={adRefreshKey}\n`;
  report += `  ...\n`;
  report += `>\n`;
  report += `\`\`\`\n`;
  
  writeFileSync(REPORT_FILE, report, 'utf-8');
  console.log(`\n📊 Report generated: ${REPORT_FILE}`);
}

function main() {
  console.log('🚀 Starting batch ad refresh update...\n');
  
  if (!existsSync(TOOLS_DIR)) {
    console.error(`❌ Tools directory not found: ${TOOLS_DIR}`);
    process.exit(1);
  }
  
  const files = readdirSync(TOOLS_DIR)
    .filter(file => file.endsWith('.tsx'))
    .filter(file => !ALREADY_UPDATED.includes(file));
  
  stats.total = files.length;
  
  console.log(`Found ${stats.total} tool files to process\n`);
  
  files.forEach(file => {
    const filePath = join(TOOLS_DIR, file);
    console.log(`Processing: ${file}...`);
    processFile(filePath);
  });
  
  console.log('\n✨ Batch update complete!\n');
  console.log(`📈 Results:`);
  console.log(`   ✅ Updated: ${stats.updated}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  console.log(`   ❌ Errors: ${stats.errors}`);
  
  generateReport();
}

main();
