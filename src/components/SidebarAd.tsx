import { AdSpace } from "./AdSpace";

export const SidebarAd = () => {
  return (
    <div
      className="sidebar-ad-wrapper sticky top-4"
      style={{ minWidth: "160px", width: "300px", maxWidth: "100%" }}
    >
      <AdSpace size="sidebar" className="mb-4" />
    </div>
  );
};