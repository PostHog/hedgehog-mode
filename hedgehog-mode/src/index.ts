export {
  HedgehogModeRenderer,
  HedgehogModeRendererContent,
} from "./HedgehogModeRenderer";
export { HedgeHogMode } from "./hedgehog-mode";
export * from "./types";

export type {
  HedgehogActorOptions,
  HedgehogActorColorOption,
  HedgehogActorAccessoryOption,
  HedgehogActorSkinOption,
  HedgehogActorFlagOption,
  HedgehogActorAccessoryInfo,
} from "./actors/hedgehog/config";
export {
  HedgehogActorColorOptions,
  getRandomAccessoryCombo,
  HedgehogActorAccessoryOptions,
  HedgehogActorSkinOptions,
  HedgehogActorFlagOptions,
  HedgehogActorFlags,
  HedgehogActorAccessories,
} from "./actors/hedgehog/config";
export { StaticHedgehog } from "./static-renderer/StaticHedgehog";
export { HedgehogCustomization } from "./ui/components/Customization";
