import { range, sample, uniqueId } from "../src/misc/utils";

describe("range", () => {
  it("returns numbers from zero to the requested length", () => {
    expect(range(3)).toEqual([0, 1, 2]);
  });
});

describe("sample", () => {
  it("returns the value selected by the random index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    expect(sample(["left", "right"])).toBe("right");
  });
});

describe("uniqueId", () => {
  it("increments IDs with the supplied prefix", () => {
    expect([uniqueId("hog-"), uniqueId("hog-")]).toEqual(["hog-1", "hog-2"]);
  });
});
