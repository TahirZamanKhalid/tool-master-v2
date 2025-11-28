import { useEffect, useRef } from 'react';

interface MonetagSquareProps {
    zoneId?: string; // Optional, defaults to the one we know
    className?: string;
}

const MonetagSquare = ({ zoneId = "188818", className }: MonetagSquareProps) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (adRef.current) {
            const script = document.createElement('script');
            script.src = "https://quge5.com/88/tag.min.js";
            script.dataset.zone = zoneId;
            script.async = true;
            script.dataset.cfasync = "false";

            // Clear previous content to prevent duplicates if re-rendered
            adRef.current.innerHTML = '';
            adRef.current.appendChild(script);
        }
    }, [zoneId]);

    return (
        <div
            ref={adRef}
            className={`w-full aspect-square flex justify-center items-center overflow-hidden ${className}`}
        >
            {/* Script will be injected here */}
        </div>
    );
};

export default MonetagSquare;
