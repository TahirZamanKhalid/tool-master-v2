import { useEffect } from 'react';

interface AdSenseSidebarProps {
    slotId: string;
    className?: string;
    style?: React.CSSProperties;
}

const AdSenseSidebar = ({ slotId, className, style }: AdSenseSidebarProps) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`w-full h-full flex justify-center items-center overflow-hidden ${className}`} style={{ minHeight: '600px', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%', height: '100%' }}
                data-ad-client="ca-pub-7382531001943020"
                data-ad-slot={slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdSenseSidebar;
