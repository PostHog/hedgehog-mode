import { HedgehogActorOptions } from "../hedgehog-mode";
import { StaticHedgehog } from "../static-renderer/StaticHedgehog";

export type HedgehogImageProps = Partial<HedgehogActorOptions> & {
  size?: number;
  assetsUrl: string;
};

// Takes a range of options and renders a static hedgehog
export function HedgehogImage({
  accessories,
  color,
  size,
  skin = "default",
  assetsUrl,
}: HedgehogImageProps): JSX.Element | null {
  const imgSize = size ?? 60;

  return (
    <div className="relative" style={{ width: imgSize, height: imgSize }}>
      <StaticHedgehog
        options={{
          id: JSON.stringify({
            skin,
            accessories,
            color,
          }),
          skin,
          accessories,
          color,
        }}
        size={imgSize}
        assetsUrl={assetsUrl}
      />
      <div className="absolute inset-0 bg-background-primary/50" />
    </div>
  );
}

export function HedgehogProfileImage({
  size,
  ...props
}: HedgehogImageProps): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "100%",
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          transform: `translateX(-3%) translateY(10%) scale(1.8)`,
        }}
      >
        <HedgehogImage {...props} size={size} />
      </div>
    </div>
  );
}
