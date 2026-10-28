import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Scope from "effect/Scope";
import type * as Feature from "../Feature.ts";
import type * as Store from "../Store.ts";
import { StoreError } from "../StoreError.ts";
interface Origin {
    readonly scope: Scope.Scope;
    readonly closed: Deferred.Deferred<void>;
}
/** @internal */
export declare const ScopeTypeId: unique symbol;
export interface Message<A> {
    readonly action: A;
    readonly execution?: Scope.Scope;
    readonly origin?: Origin;
    readonly receipt: Deferred.Deferred<void, StoreError>;
}
export interface Runtime<S, A> {
    readonly store: Store.Store<S, A>;
    readonly take: Effect.Effect<Message<A>, StoreError>;
    readonly peek: Effect.Effect<Option.Option<Message<A>>>;
    readonly commit: (message: Message<A>) => Effect.Effect<void, StoreError>;
    readonly active: Effect.Effect<number>;
    readonly checkOpen: Effect.Effect<void, StoreError>;
}
export declare const makeRuntime: <S, A, R, I>(feature: Feature.Definition<S, A, R, I>, options?: {
    readonly capacity?: number;
    readonly initialState?: S;
    readonly input?: I;
} | undefined, testing?: boolean | undefined) => Effect.Effect<Runtime<S, A>, StoreError, R | Scope.Scope>;
export declare const makeStore: <S, A, R, I>(feature: Feature.Definition<S, A, R, I>, options?: {
    readonly capacity?: number;
    readonly initialState?: S;
    readonly input?: I;
} | undefined) => Effect.Effect<Store.Store<S, A>, StoreError, R | Scope.Scope>;
export {};
