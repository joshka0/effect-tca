/**
 * Stepwise assertions over the production store runtime.
 * @since 0.0.1
 */
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type * as Scope from "effect/Scope";
import type * as Feature from "./Feature.ts";
import type * as Store from "./Store.ts";
import { StoreError } from "./StoreError.ts";
/**
 * Assertions for a feature's actions and complete state snapshots.
 * Call finish before leaving the scope to detect unfinished work.
 * @category models
 * @since 0.0.1
 */
export interface TestStore<S, A> {
    readonly get: Effect.Effect<S, StoreError>;
    readonly send: (action: A, update?: (previous: S) => S) => Effect.Effect<void, StoreError>;
    readonly receive: (action: A, update?: (previous: S) => S) => Effect.Effect<void, StoreError>;
    readonly finish: Effect.Effect<void, StoreError>;
}
/**
 * Supply the test runner's deep-equality assertion, for example assert.deepStrictEqual.
 * The receive timeout defaults to five seconds on the caller's Effect clock.
 * With a TestClock, advance time explicitly; the test runner still owns wall timeouts.
 * @category models
 * @since 0.0.1
 */
export type Options<S, I = void> = Store.Options<S, I> & {
    readonly assertEquals: (actual: unknown, expected: unknown) => void;
    readonly timeout?: Duration.Input;
};
/**
 * Runs a feature with held effect emissions and exhaustive snapshot assertions.
 * Expected state defaults to unchanged. Assertion failures retain their original cause.
 * @category constructors
 * @since 0.0.1
 */
export declare const make: <S, A, R, I>(feature: Feature.Definition<S, A, R, I>, options: Options<S, I>) => Effect.Effect<TestStore<S, A>, StoreError, R | Scope.Scope>;
/**
 * Runs a scoped scenario and checks for pending actions and effects when it succeeds.
 * Returns the scenario's result. On failure, preserves its error without running finish.
 * Disposal always closes the store; clock advancement remains the caller's responsibility.
 * @category constructors
 * @since 0.0.1
 */
export declare const scenario: <S, A, R, I, B, E, R2>(feature: Feature.Definition<S, A, R, I>, options: Options<S, I>, run: (store: TestStore<S, A>) => Effect.Effect<B, E, R2>) => Effect.Effect<B, StoreError | E, Exclude<R | R2, Scope.Scope>>;
