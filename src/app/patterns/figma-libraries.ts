// Figma library aliases for component matching (specs/005-component-figma-mapping).
// Redirecting to a different library file later is a one-line change here —
// never edit every registry entry that references it.

export type FigmaLibraryAlias = "leaf";

export const FIGMA_LIBRARIES: Record<
  FigmaLibraryAlias,
  { fileKey: string; libraryKey: string; name: string }
> = {
  leaf: {
    fileKey: "BYYBVG0tM2CmNo7p4kC96W",
    libraryKey:
      "lk-5a95d848db1508fb5daa85b15840ef400cdbf4c1ba657288bebc79cb0e19afece95c41cdd820bd31e330f9b215316354a85600bffeb026ff8f01d10c29ef4ade",
    name: "Leaf Public Sites Lib-test",
  },
};

export type FigmaRef = {
  library: FigmaLibraryAlias;
  nodeId: string;
  status: "mapped" | "no-match";
  verifiedAt: string;
  notes?: string;
};
