import React from 'react';
import AdSenseBanner from './ads/AdSenseBanner';
import AdSenseSidebar from './ads/AdSenseSidebar';
import MonetagSquare from './ads/MonetagSquare';

interface AdGridLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const AdGridLayout = ({ children, className = "" }: AdGridLayoutProps) => {
    return (
        <div className={`w-full max-w-[1600px] mx-auto p-4 ${className}`}>
            {/* Desktop Grid Layout */}
            <div className="hidden xl:grid grid-cols-[300px_1fr_300px] gap-4">

                {/* Top Row */}
                <div className="col-span-1">
                    <MonetagSquare />
                </div>
                <div className="col-span-1">
                    <AdSenseBanner slotId="YOUR_BANNER_SLOT_ID_TOP" />
                </div>
                <div className="col-span-1">
                    <MonetagSquare />
                </div>

                {/* Middle Row (Main Content) */}
                <div className="col-span-1 h-full">
                    <AdSenseSidebar slotId="YOUR_SIDEBAR_SLOT_ID_LEFT" />
                </div>
                <div className="col-span-1 min-h-[600px]">
                    {children}
                </div>
                <div className="col-span-1 h-full">
                    <AdSenseSidebar slotId="YOUR_SIDEBAR_SLOT_ID_RIGHT" />
                </div>

                {/* Bottom Row */}
                <div className="col-span-1">
                    <MonetagSquare />
                </div>
                <div className="col-span-1">
                    <AdSenseBanner slotId="YOUR_BANNER_SLOT_ID_BOTTOM" />
                </div>
                <div className="col-span-1">
                    <MonetagSquare />
                </div>
            </div>

            {/* Mobile/Tablet Stacked Layout */}
            <div className="flex flex-col gap-4 xl:hidden">
                {/* Top Ads */}
                <AdSenseBanner slotId="YOUR_BANNER_SLOT_ID_TOP" />

                {/* Main Content */}
                <div className="w-full">
                    {children}
                </div>

                {/* Bottom Ads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AdSenseBanner slotId="YOUR_BANNER_SLOT_ID_BOTTOM" />
                    <MonetagSquare className="hidden md:flex" />
                </div>
            </div>
        </div>
    );
};

export default AdGridLayout;
