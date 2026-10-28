import type * as Schema from "effect/Schema";
import * as FeatureEffect from "../FeatureEffect.ts";
/** One context and cancellation identity per case, shared across reducer calls. */
export declare const createEffectContexts: <Cases extends Record<string, Schema.Constraint>>(schema: Schema.TaggedUnion<Cases>) => { readonly [K in keyof Cases]: FeatureEffect.Context<Cases>; };
