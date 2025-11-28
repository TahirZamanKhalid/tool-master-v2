import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface AdSenseBannerProps {
    slotId: string;
    className?: string;
    style?: React.CSSProperties;
}

const AdSenseBanner = ({ slotId, className, style }: AdSenseBannerProps) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`w-full flex justify-center items-center overflow-hidden bg-gray-50/50 rounded-lg border border-gray-100 ${className}`} style={{ minHeight: '90px', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
            {/* Fallback/Placeholder for development */}
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none opacity-0 hover:opacity-100">
                AdSense Banner
            </div>
        </div>
    );
};

export default AdSenseBanner;
