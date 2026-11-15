// Next.js resolves this marker during builds. Node integration tests use its empty server entry.
import { registerHooks } from "node:module";

const emptyServerEntry = import.meta
  .resolve("next/dist/compiled/server-only/empty.js");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: emptyServerEntry, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
