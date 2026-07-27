import { HedgehogActorAI } from "../src/actors/hedgehog/ai";
import type { HedgehogActor } from "../src/actors/Hedgehog";

// The AI only ever pokes at these few members of the actor, so a stub is enough
// to assert the thing that matters: it keeps its hands off him in mid-air.
const fakeActor = (isSettled: boolean) => {
  const actor = {
    isSettled,
    walkSpeed: 0,
    jump: vi.fn<() => void>(),
    setDirection: vi.fn<() => void>(),
    updateSprite: vi.fn<() => void>(),
  };
  return actor as unknown as HedgehogActor & typeof actor;
};

const didSomething = (actor: ReturnType<typeof fakeActor>): boolean =>
  actor.jump.mock.calls.length > 0 ||
  actor.updateSprite.mock.calls.length > 0 ||
  actor.walkSpeed !== 0;

describe("hedgehog AI", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("takes no action while the hog is unsettled", () => {
    const actor = fakeActor(false);
    new HedgehogActorAI(actor).enable();

    // Plenty of retries — no walking, no jumping, no waving in mid-air.
    vi.advanceTimersByTime(10000);

    expect(didSomething(actor)).toBe(false);
  });

  it("acts again once the hog lands", () => {
    // Pin the weighted action pick to its last entry (walking) so the assertion
    // doesn't depend on which idle behaviour the dice hand us.
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const actor = fakeActor(false);
    new HedgehogActorAI(actor).enable();
    vi.advanceTimersByTime(1000);
    expect(didSomething(actor)).toBe(false);

    actor.isSettled = true;
    vi.advanceTimersByTime(1000);

    expect(actor.walkSpeed).not.toBe(0);
  });

  it("ignores an explicitly requested action while unsettled", () => {
    const actor = fakeActor(false);
    const ai = new HedgehogActorAI(actor);
    ai.enable();
    ai.run("jump");

    expect(actor.jump).not.toHaveBeenCalled();
  });
});
