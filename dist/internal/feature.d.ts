import * as Optic from "effect/Optic";
import type { Definition, Route, Transition } from "../Feature.ts";
export declare const makeDefinition: <S, A, R = never, I = void>(spec: {
    readonly initial: (input: I) => S;
    readonly reduce: (state: S, action: A) => Transition<S, A, R>;
}) => Definition<S, A, R, I>;
export declare const stateLens: <S, CS>(state: Optic.Lens<S, CS> | keyof S) => Optic.Lens<S, CS>;
export declare const actionRoute: <A, CA>(action: Route<A, CA> | string) => Route<A, CA>;
