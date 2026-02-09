import { AdSpace } from "./AdSpace";

export const ContentAdBreak = ({ index }: { index?: number }) => {
  return (
    <div className="content-ad-break my-8">
      <AdSpace
        size="medium-rect"
        className="mx-auto"
      />
    </div>
  );
};
