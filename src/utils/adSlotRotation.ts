// Ad slot rotation to maximize impressions across different ad units

export const displayAdSlots = [
  "2918331088", // Display Ad 2
  "4402803148", // Display Ad 3
];

export const infeedAdSlots = [
  { slot: "4739066253", layoutKey: "-gk-24+14-4r+ke" }, // In-feed Ad 1
  { slot: "1968211491", layoutKey: "-g5-1u+99-a6-k8" },  // In-feed Ad 2
];

export const multiplexAdSlots = [
  "2127993591", // Multiplex Ad 1
  "4356563508", // Multiplex Ad 2
  "7202218695", // Multiplex Ad 3
];

// Get a display ad slot based on page/position
export const getDisplayAdSlot = (index: number = 0): string => {
  return displayAdSlots[index % displayAdSlots.length];
};

// Get an in-feed ad configuration
export const getInfeedAdConfig = (index: number = 0) => {
  return infeedAdSlots[index % infeedAdSlots.length];
};

// Get a multiplex ad slot
export const getMultiplexAdSlot = (index: number = 0): string => {
  return multiplexAdSlots[index % multiplexAdSlots.length];
};

// Generate a semi-random index based on current path and position
export const getAdIndex = (position: 'top' | 'bottom' | 'sidebar-left' | 'sidebar-right' | 'content' = 'top'): number => {
  const path = window.location.pathname;
  const pathHash = path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const positionHash = position.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.abs(pathHash + positionHash);
};
