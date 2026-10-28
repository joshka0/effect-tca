import type { Draft, Transition } from "../Feature.ts";
import type * as FeatureEffect from "../FeatureEffect.ts";
export declare const snapshot: <S extends object>(state: S) => S;
export declare const draftTransition: <S extends object, A, R>(state: S, reduce: (draft: Draft<S>) => FeatureEffect.ReducerEffect<A, R>) => Transition<S, A, R>;
