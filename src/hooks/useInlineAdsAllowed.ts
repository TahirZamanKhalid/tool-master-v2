import { useLocation } from "react-router-dom";

export const useInlineAdsAllowed = () => {
  const { pathname } = useLocation();

  const isToolRoute =
    pathname === "/tools" ||
    pathname.startsWith("/tools/") ||
    pathname.startsWith("/category/");

  return !isToolRoute;
};
