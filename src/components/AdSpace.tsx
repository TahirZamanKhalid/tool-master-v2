interface AdSpaceProps {
  size: "banner" | "leaderboard" | "rectangle" | "skyscraper";
  className?: string;
}

const adSizes = {
  banner: "h-[50px] md:h-[90px]",
  leaderboard: "h-[90px] md:h-[250px]",
  rectangle: "h-[250px]",
  skyscraper: "h-[600px]",
};

const adLabels = {
  banner: "728x90 Ad",
  leaderboard: "970x90 Ad",
  rectangle: "300x250 Ad",
  skyscraper: "300x600 Ad",
};

export const AdSpace = ({ size, className = "" }: AdSpaceProps) => {
  return (
    <div
      className={`bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center ${adSizes[size]} ${className}`}
    >
      <p className="text-sm text-muted-foreground font-medium">{adLabels[size]} Space</p>
    </div>
  );
};
