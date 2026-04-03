/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyze from "../analyze.js";
import type * as lib_aiProvider from "../lib/aiProvider.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as releases from "../releases.js";
import type * as slack from "../slack.js";
import type * as syncActions from "../syncActions.js";
import type * as syncMutations from "../syncMutations.js";
import type * as tests_testGithub from "../tests/testGithub.js";
import type * as tests_testLinear from "../tests/testLinear.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyze: typeof analyze;
  "lib/aiProvider": typeof lib_aiProvider;
  "lib/prompts": typeof lib_prompts;
  releases: typeof releases;
  slack: typeof slack;
  syncActions: typeof syncActions;
  syncMutations: typeof syncMutations;
  "tests/testGithub": typeof tests_testGithub;
  "tests/testLinear": typeof tests_testLinear;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
