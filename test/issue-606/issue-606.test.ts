import { assertEquals } from "https://deno.land/std@0.180.0/testing/asserts.ts";

Deno.test("issue #606", async (t) => {
  const { version } = await fetch("http://localhost:8080/status.json").then((
    res,
  ) => res.json());

  await t.step("check dts of the main module", async () => {
    const res = await fetch(
      "http://localhost:8080/@sinclair/typebox@0.28.5",
    );
    res.body?.cancel()
    assertEquals(
      res.headers.get("x-typescript-types")!,
      `http://localhost:8080/v${version}/@sinclair/typebox@0.28.5/typebox.d.ts`,
    );
  });

  await t.step("check dts of a submodule", async () => {
    const res = await fetch(
      "http://localhost:8080/@sinclair/typebox@0.28.5/value",
    );
    res.body?.cancel()
    assertEquals(
      res.headers.get("x-typescript-types")!,
      `http://localhost:8080/v${version}/@sinclair/typebox@0.28.5/value/index.d.ts`,
    );
  });
});
