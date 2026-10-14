import "pixi.js/unsafe-eval";
import { GlUniformGroupSystem, UniformGroup } from "pixi.js";
import { guardMissingUniforms } from "../src/misc/uniformSync";

type Generate = Parameters<typeof guardMissingUniforms>[0];

const polyfill = (
  GlUniformGroupSystem.prototype as unknown as {
    _generateUniformsSync: Generate;
  }
)._generateUniformsSync;

function setup() {
  const group = new UniformGroup({
    uAlpha: { value: 0.5, type: "f32" },
    uTint: { value: 0.25, type: "f32" },
  });
  const programUniforms = {
    uAlpha: { value: 0, location: "alpha" },
    uTint: { value: 0, location: "tint" },
  };
  const gl = { uniform1f: vi.fn<(location: string, value: number) => void>() };
  return { group, programUniforms, renderer: { gl } };
}

describe("guardMissingUniforms", () => {
  it("reproduces the crash without the guard", () => {
    const { group, programUniforms, renderer } = setup();
    const sync = polyfill(group, programUniforms);

    expect(() =>
      sync({ uAlpha: programUniforms.uAlpha }, group.uniforms, renderer)
    ).toThrow(TypeError);
  });

  it("syncs every uniform when the program has them all", () => {
    const { group, programUniforms, renderer } = setup();
    const sync = guardMissingUniforms(polyfill)(group, programUniforms);

    sync(programUniforms, group.uniforms, renderer);

    expect(renderer.gl.uniform1f).toHaveBeenCalledWith("alpha", 0.5);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith("tint", 0.25);
  });

  it("skips a uniform the running program does not have", () => {
    const { group, programUniforms, renderer } = setup();
    const sync = guardMissingUniforms(polyfill)(group, programUniforms);

    sync({ uAlpha: programUniforms.uAlpha }, group.uniforms, renderer);

    expect(renderer.gl.uniform1f).toHaveBeenCalledTimes(1);
    expect(renderer.gl.uniform1f).toHaveBeenCalledWith("alpha", 0.5);
  });
});
