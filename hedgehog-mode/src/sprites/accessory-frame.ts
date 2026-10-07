import sprites from "../../assets/sprites.json";

/**
 * The sprite frame for an accessory worn by a skin. A skin whose face differs
 * from the hedgehog's can ship its own version as
 * `skins/<skin>/accessories/<accessory>.png` (the pig's antlers have a red
 * snout, not a red button nose). Other skins use the shared accessory.
 */
export function accessoryFrameName(
  skin: string | null | undefined,
  accessory: string
): string {
  const skinned = `skins/${skin ?? "default"}/accessories/${accessory}.png`;
  return skinned in sprites.frames ? skinned : `accessories/${accessory}.png`;
}
