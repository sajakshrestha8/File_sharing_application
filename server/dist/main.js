"use strict";
/**
 * Temporary TypeScript entrypoint.
 *
 * This step scaffolds a DDD-friendly TS backend without changing runtime behavior yet.
 * The current JS server (`server/index.js`) remains the actual implementation until
 * later steps replace it with the DDD layers.
 */
// Use CommonJS `require` to avoid having TypeScript try to typecheck/emit JS files.
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("../index");
