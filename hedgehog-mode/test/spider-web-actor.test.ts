import { SpiderWebActor } from "../src/items/SpiderWebActor";
import type { HedgehogModeInterface } from "../src/types";
import type { HedgehogActor } from "../src/actors/Hedgehog";

describe("SpiderWebActor.spawn", () => {
  const actor = {} as HedgehogActor;
  const point = { x: 0, y: 0 };

  it("returns null when the app has no stage (init/teardown race)", () => {
    // app exists but stage is gone — the gap before app.init() or after
    // app.destroy(). Spawning here used to dereference a null stage and crash.
    const game = { app: {} } as unknown as HedgehogModeInterface;
    expect(SpiderWebActor.spawn(game, actor, point)).toBeNull();
  });

  it("returns null when the app itself is missing", () => {
    const game = {} as unknown as HedgehogModeInterface;
    expect(SpiderWebActor.spawn(game, actor, point)).toBeNull();
  });
});
