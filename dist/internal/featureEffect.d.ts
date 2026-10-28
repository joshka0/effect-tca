import type * as Scope from "effect/Scope";
import type * as FeatureEffect from "../FeatureEffect.ts";
export type Operation<A, R> = FeatureEffect.Run<A, R> | FeatureEffect.Cancel;
export declare function normalize<A, R>(effect: FeatureEffect.Program<A, R> | FeatureEffect.Run<A, R>): FeatureEffect.Run<A, Exclude<R, Scope.Scope>>;
export declare function normalize<A, R>(effect: FeatureEffect.FeatureEffect<A, R>): Operation<A, R>;
