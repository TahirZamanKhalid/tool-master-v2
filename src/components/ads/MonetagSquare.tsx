import { useEffect, useRef } from 'react';

const MonetagSquare = ({ className }: { className?: string }) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (adRef.current) {
            const script = document.createElement('script');
            script.src = "https://3nbf4.com/act/files/tag.min.js?z=10250230";
            script.async = true;
            script.dataset.cfasync = "false";

            // Clear previous content to prevent duplicates if re-rendered
            adRef.current.innerHTML = '';
            adRef.current.appendChild(script);
        }
    }, []);

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
