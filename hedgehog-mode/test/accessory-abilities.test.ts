import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock factories are hoisted above imports, so shared mock state referenced
// inside them must be declared via vi.hoisted() rather than a plain module-scope
// `const` binding — otherwise the factory closes over a binding that is still in
// its temporal dead zone at hoist time (Task 3 hit this exact trap with gsap).
const { created } = vi.hoisted(() => ({
  created: [] as Array<{ fire: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }>,
}));

vi.mock("../src/actors/hedgehog/config", () => ({
  getAccessoryAbilityFactory: (accessory: string) =>
    accessory === "catherine-wheel"
      ? () => {
          const ability = { fire: vi.fn(), destroy: vi.fn() };
          created.push(ability);
          return ability;
        }
      : undefined,
}));

import { HedgehogAccessoryAbilities } from "../src/actors/hedgehog/accessory-abilities";

const makeActor = (accessories: string[]) => ({ options: { accessories } });

describe("HedgehogAccessoryAbilities", () => {
  beforeEach(() => {
    created.length = 0;
  });

  it("builds an ability for an accessory that grants one", () => {
    const actor = makeActor(["catherine-wheel"]);
    new HedgehogAccessoryAbilities(actor as never, {} as never).sync();

    expect(created).toHaveLength(1);
  });

  it("ignores purely cosmetic accessories", () => {
    const actor = makeActor(["tophat", "sunglasses"]);
    new HedgehogAccessoryAbilities(actor as never, {} as never).sync();

    expect(created).toHaveLength(0);
  });

  it("does not rebuild on an unrelated option change", () => {
    // updateOptions() runs sync() on every change — colour, AI toggle, drag.
    // Rebuilding here would kill a firework mid-burn.
    const actor = makeActor(["catherine-wheel"]);
    const abilities = new HedgehogAccessoryAbilities(actor as never, {} as never);

    abilities.sync();
    abilities.sync();
    abilities.sync();

    expect(created).toHaveLength(1);
    expect(created[0].destroy).not.toHaveBeenCalled();
  });

  it("tears the ability down when the accessory comes off", () => {
    const actor = makeActor(["catherine-wheel"]);
    const abilities = new HedgehogAccessoryAbilities(actor as never, {} as never);
    abilities.sync();

    actor.options.accessories = [];
    abilities.sync();

    expect(created[0].destroy).toHaveBeenCalledTimes(1);
  });

  it("fans fire out to every live ability", () => {
    const actor = makeActor(["catherine-wheel"]);
    const abilities = new HedgehogAccessoryAbilities(actor as never, {} as never);
    abilities.sync();

    abilities.fire();

    expect(created[0].fire).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when nothing grants an ability", () => {
    const actor = makeActor(["tophat"]);
    const abilities = new HedgehogAccessoryAbilities(actor as never, {} as never);
    abilities.sync();

    expect(() => abilities.fire()).not.toThrow();
    expect(() => abilities.destroy()).not.toThrow();
  });

  it("destroys everything and can be destroyed twice", () => {
    const actor = makeActor(["catherine-wheel"]);
    const abilities = new HedgehogAccessoryAbilities(actor as never, {} as never);
    abilities.sync();

    abilities.destroy();
    abilities.destroy();

    expect(created[0].destroy).toHaveBeenCalledTimes(1);
  });

  it("copes with a hedgehog wearing nothing", () => {
    const abilities = new HedgehogAccessoryAbilities({ options: {} } as never, {} as never);

    expect(() => abilities.sync()).not.toThrow();
    expect(created).toHaveLength(0);
  });
});
