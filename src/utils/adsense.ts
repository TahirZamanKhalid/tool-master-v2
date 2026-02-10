declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const ensureAdSenseLoaded = (): boolean => {
    if (typeof window === 'undefined') return false;

    if (!window.adsbygoogle) {
        window.adsbygoogle = [];
        console.log('[AdSense] Initialized array');
    }

    return true;
};

export const pushAd = (): boolean => {
    try {
        if (!ensureAdSenseLoaded()) return false;

        window.adsbygoogle.push({});
        console.log('[AdSense] Ad pushed, total:', window.adsbygoogle.length);
        return true;
    } catch (error) {
        console.error('[AdSense] Push error:', error);
        return false;
    }
};