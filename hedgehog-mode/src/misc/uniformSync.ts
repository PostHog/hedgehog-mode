type UniformData = Record<string, { value: unknown } | undefined>;
type UniformGroupLike = { uniformStructures: Record<string, unknown> };
type UniformsSync = (
  ud: UniformData,
  uv: Record<string, unknown>,
  renderer: unknown,
  syncData?: unknown
) => void;
type GenerateUniformsSync = (
  group: UniformGroupLike,
  uniformData: UniformData
) => UniformsSync;

// `pixi.js/unsafe-eval` builds each uniform sync function from the uniform list of the shared
// GlProgram, then runs it against one renderer's `programData.uniformData` and reads
// `ud[name].value` with no check. When the two lists differ (seen once on Mobile Safari, most
// likely after a second renderer or a lost WebGL context), the frame throws
// "undefined is not an object" and the render loop stops. This wrapper skips the uniforms
// that the running program does not have, and keeps the original function as the fast path.
export function guardMissingUniforms(
  generate: GenerateUniformsSync
): GenerateUniformsSync {
  return function (this: unknown, group, uniformData) {
    const sync = generate.call(this, group, uniformData);
    const names = Object.keys(group.uniformStructures).filter(
      (name) => uniformData[name]
    );

    return (ud, uv, renderer, syncData) => {
      if (names.every((name) => ud[name])) {
        sync(ud, uv, renderer, syncData);
        return;
      }
      const present: UniformData = {};
      for (const name of names) {
        if (ud[name]) {
          present[name] = uniformData[name];
        }
      }
      generate.call(this, group, present)(ud, uv, renderer, syncData);
    };
  };
}
