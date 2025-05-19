interface HedgehogMode {
  spawnHedgehog: (options: {
    id: string;
    controls_enabled: boolean;
    accessories: string[];
    color: string;
  }) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    hedgehogMode?: HedgehogMode;
  }
}

export {};
