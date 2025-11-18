#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Ad-related imports to remove
AD_IMPORTS = [
    r"import\s+{[^}]*AdSpace[^}]*}\s+from\s+['\"]@/components/AdSpace['\"];?\s*\n",
    r"import\s+{[^}]*LazyAdSpace[^}]*}\s+from\s+['\"]@/components/LazyAdSpace['\"];?\s*\n",
    r"import\s+{[^}]*AdRow[^}]*}\s+from\s+['\"]@/components/AdRow['\"];?\s*\n",
    r"import\s+{[^}]*SidebarAd[^}]*}\s+from\s+['\"]@/components/SidebarAd['\"];?\s*\n",
    r"import\s+{[^}]*ContentAdBreak[^}]*}\s+from\s+['\"]@/components/ContentAdBreak['\"];?\s*\n",
    r"import\s+{[^}]*AdWatchModal[^}]*}\s+from\s+['\"]@/components/AdWatchModal['\"];?\s*\n",
    r"import\s+{[^}]*GeneratingAdModal[^}]*}\s+from\s+['\"]@/components/GeneratingAdModal['\"];?\s*\n",
    r"import\s+{[^}]*PeriodicAdModal[^}]*}\s+from\s+['\"]@/components/PeriodicAdModal['\"];?\s*\n",
    r"import\s+{[^}]*ProcessingOverlay[^}]*}\s+from\s+['\"]@/components/ProcessingOverlay['\"];?\s*\n",
    r"import\s+{[^}]*useAdRefresh[^}]*}\s+from\s+['\"]@/hooks/useAdRefresh['\"];?\s*\n",
    r"import\s+{[^}]*usePeriodicAds[^}]*}\s+from\s+['\"]@/hooks/usePeriodicAds['\"];?\s*\n",
    r"import\s+{[^}]*getDisplayAdSlot[^}]*,?\s*getAdIndex[^}]*}\s+from\s+['\"]@/utils/adSlotRotation['\"];?\s*\n",
    r"import\s+{[^}]*getAdIndex[^}]*,?\s*getDisplayAdSlot[^}]*}\s+from\s+['\"]@/utils/adSlotRotation['\"];?\s*\n",
]

def remove_ad_jsx_components(content):
    """Remove ad component JSX tags"""
    # Remove self-closing ad components
    content = re.sub(r'<(AdSpace|LazyAdSpace|AdRow|SidebarAd|ContentAdBreak|AdWatchModal|GeneratingAdModal|PeriodicAdModal|ProcessingOverlay)[^>]*/>[\s\n]*', '', content)
    
    # Remove opening and closing ad component tags (with any content between)
    content = re.sub(r'<(AdSpace|LazyAdSpace|AdRow|SidebarAd|ContentAdBreak|AdWatchModal|GeneratingAdModal|PeriodicAdModal|ProcessingOverlay)[^>]*>[\s\S]*?</\1>[\s\n]*', '', content)
    
    return content

def remove_ad_related_state(content):
    """Remove ad-related state and functions"""
    # Remove showAdModal state
    content = re.sub(r'const\s+\[showAdModal,\s+setShowAdModal\]\s*=\s*useState\(false\);?\s*\n', '', content)
    content = re.sub(r'const\s+\[showAdModal,\s+setShowAdModal\]\s*=\s*useState<boolean>\(false\);?\s*\n', '', content)
    
    # Remove showGeneratingAd state
    content = re.sub(r'const\s+\[showGeneratingAd,\s+setShowGeneratingAd\]\s*=\s*useState\(false\);?\s*\n', '', content)
    content = re.sub(r'const\s+\[showGeneratingAd,\s+setShowGeneratingAd\]\s*=\s*useState<boolean>\(false\);?\s*\n', '', content)
    
    # Remove adAction state
    content = re.sub(r'const\s+\[adAction,\s+setAdAction\]\s*=\s*useState<[^>]+>\([^)]*\);?\s*\n', '', content)
    
    # Remove useAdRefresh hook calls
    content = re.sub(r'useAdRefresh\([^)]*\);?\s*\n', '', content)
    
    # Remove usePeriodicAds hook calls  
    content = re.sub(r'usePeriodicAds\([^)]*\);?\s*\n', '', content)
    
    # Remove ad-related function definitions
    content = re.sub(r'const\s+handleAdWatched\s*=\s*\([^)]*\)\s*=>\s*{[^}]*};?\s*\n', '', content)
    content = re.sub(r'const\s+handleCopyClick\s*=\s*\([^)]*\)\s*=>\s*{\s*setAdAction\([^)]*\);\s*setShowAdModal\(true\);\s*};?\s*\n', '', content)
    content = re.sub(r'const\s+handleDownloadClick\s*=\s*\([^)]*\)\s*=>\s*{\s*setAdAction\([^)]*\);\s*setShowAdModal\(true\);\s*};?\s*\n', '', content)
    
    return content

def clean_file(file_path):
    """Clean a single file of ad-related code"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove imports
        for pattern in AD_IMPORTS:
            content = re.sub(pattern, '', content)
        
        # Remove JSX components
        content = remove_ad_jsx_components(content)
        
        # Remove ad-related state and functions
        content = remove_ad_related_state(content)
        
        # Remove extra blank lines (more than 2 consecutive)
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    src_dir = Path('src')
    files_cleaned = 0
    
    # Process all .tsx and .ts files
    for file_path in src_dir.rglob('*.tsx'):
        if clean_file(file_path):
            files_cleaned += 1
            print(f"Cleaned: {file_path}")
    
    for file_path in src_dir.rglob('*.ts'):
        if file_path.name != 'types.ts':  # Skip type definition files
            if clean_file(file_path):
                files_cleaned += 1
                print(f"Cleaned: {file_path}")
    
    print(f"\n✓ Cleaned {files_cleaned} files")

if __name__ == '__main__':
    main()
