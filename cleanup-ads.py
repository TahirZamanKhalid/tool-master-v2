#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Patterns to remove
ad_imports = [
    r'import.*AdSpace.*from.*\n',
    r'import.*LazyAdSpace.*from.*\n',
    r'import.*AdRow.*from.*\n',
    r'import.*SidebarAd.*from.*\n',
    r'import.*ContentAdBreak.*from.*\n',
    r'import.*AdWatchModal.*from.*\n',
    r'import.*GeneratingAdModal.*from.*\n',
    r'import.*PeriodicAdModal.*from.*\n',
    r'import.*ProcessingOverlay.*from.*\n',
    r'import.*useAdRefresh.*from.*\n',
    r'import.*usePeriodicAds.*from.*\n',
    r'import.*adSlotRotation.*from.*\n',
]

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove ad imports
        for pattern in ad_imports:
            content = re.sub(pattern, '', content)
        
        # Remove ad usage patterns (hook calls)
        content = re.sub(r'\s*const\s+adRefreshKey\s*=\s*useAdRefresh\([^)]*\);?\n?', '', content)
        content = re.sub(r'\s*const\s+\{\s*showAd.*?usePeriodicAds\([^)]*\);?\n?', '', content, flags=re.DOTALL)
        
        # Remove ad component JSX (simple cases)
        content = re.sub(r'<AdSpace[^>]*(?:/>|>.*?</AdSpace>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<LazyAdSpace[^>]*(?:/>|>.*?</LazyAdSpace>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<AdRow[^>]*(?:/>|>.*?</AdRow>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<SidebarAd[^>]*(?:/>|>.*?</SidebarAd>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<ContentAdBreak[^>]*(?:/>|>.*?</ContentAdBreak>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<AdWatchModal[^>]*(?:/>|>.*?</AdWatchModal>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<GeneratingAdModal[^>]*(?:/>|>.*?</GeneratingAdModal>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<PeriodicAdModal[^>]*(?:/>|>.*?</PeriodicAdModal>)', '', content, flags=re.DOTALL)
        content = re.sub(r'<ProcessingOverlay[^>]*(?:/>|>.*?</ProcessingOverlay>)', '', content, flags=re.DOTALL)
        
        # Remove ad-related divs with comments
        content = re.sub(r'\s*{?/\*.*?[Aa]d.*?\*/}?\s*\n?\s*<div[^>]*>.*?</div>\s*', '', content, flags=re.DOTALL)
        
        # Remove adRefreshKey props
        content = re.sub(r'\s*adRefreshKey=\{[^}]+\}', '', content)
        
        # Clean up multiple blank lines
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Cleaned: {filepath}")
            return True
        return False
        
    except Exception as e:
        print(f"✗ Error cleaning {filepath}: {e}")
        return False

# Process all TypeScript/TSX files
base_paths = [
    'src/pages',
    'src/components', 
    'src/hooks'
]

cleaned_count = 0
for base in base_paths:
    if os.path.exists(base):
        for root, dirs, files in os.walk(base):
            for file in files:
                if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                    filepath = os.path.join(root, file)
                    if clean_file(filepath):
                        cleaned_count += 1

print(f"\n✓ Total files cleaned: {cleaned_count}")
