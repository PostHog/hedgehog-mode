import { useEffect, useState } from "react";
import { HedgehogActorOptions } from "../hedgehog-mode";
import { StaticHedgehogRenderer } from "../static-renderer/StaticHedgehog";
export type HedgehogImageProps = Partial<HedgehogActorOptions> & {
  renderer: StaticHedgehogRenderer;
  size?: number;
};

// Takes a range of options and renders a static hedgehog
export function HedgehogImage({
  renderer,
  accessories,
  color,
  size,
  skin = "default",
}: HedgehogImageProps): JSX.Element | null {
  const imgSize = size ?? 60;

  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    void renderer
      .render(
        {
          id: JSON.stringify({
            skin,
            accessories,
            color,
          }),
          skin,
          accessories,
          color,
        },
        imgSize * 4
      )
      .then((src) => {
        setDataUrl(src);
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error("Error rendering hedgehog", e);
      });
  }, [skin, accessories, color, imgSize]);

  return (
    <div className="relative" style={{ width: imgSize, height: imgSize }}>
      {dataUrl ? <img src={dataUrl} width={imgSize} height={imgSize} /> : null}
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
