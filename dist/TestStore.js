import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { makeRuntime } from "./internal/store.js";
import { StoreError } from "./StoreError.js";
/**
 * Runs a feature with held effect emissions and exhaustive snapshot assertions.
 * Expected state defaults to unchanged. Assertion failures retain their original cause.
 * @category constructors
 * @since 0.0.1
 */
export const make = Effect.fnUntraced(function* (feature, options) {
    const runtime = yield* makeRuntime(feature, options, true);
    const assert = (actual, expected) => Effect.try({
        try: () => options.assertEquals(actual, expected),
        catch: (cause) => StoreError.make({ reason: "Assertion", message: "TestStore expectation failed", cause }),
    });
    const expectedState = (previous, update) => Effect.try({
        try: () => (update === undefined ? previous : update(previous)),
        catch: (cause) => StoreError.make({ reason: "Assertion", message: "Expected-state callback failed", cause }),
    });
    const noPending = Effect.gen(function* () {
        yield* Effect.yieldNow;
        yield* runtime.checkOpen;
        const pending = yield* runtime.peek;
        if (Option.isSome(pending))
            return yield* StoreError.make({
                reason: "Assertion",
                message: "Receive pending effect actions before sending or finishing",
                cause: pending.value.action,
            });
    });
    return {
        get: runtime.store.get,
        send: Effect.fnUntraced(function* (action, update) {
            yield* noPending;
            const expected = yield* expectedState(yield* runtime.store.get, update);
            yield* runtime.store.send(action);
            yield* assert(yield* runtime.store.get, expected);
        }),
        receive: Effect.fnUntraced(function* (action, update) {
            const message = yield* runtime.take.pipe(Effect.timeout(options.timeout ?? "5 seconds"), Effect.catchTag("TimeoutError", (cause) => Effect.fail(StoreError.make({
                reason: "Assertion",
                message: "Expected effect action did not arrive",
                cause,
            }))));
            yield* assert(message.action, action);
            const expected = yield* expectedState(yield* runtime.store.get, update);
            yield* runtime.commit(message);
            yield* assert(yield* runtime.store.get, expected);
        }),
        finish: Effect.gen(function* () {
            yield* noPending;
            const active = yield* runtime.active;
            if (active > 0)
                return yield* StoreError.make({
                    reason: "Assertion",
                    message: "Effects or their cleanup are still running",
                });
        }),
    };
});
/**
 * Runs a scoped scenario and checks for pending actions and effects when it succeeds.
 * Returns the scenario's result. On failure, preserves its error without running finish.
 * Disposal always closes the store; clock advancement remains the caller's responsibility.
 * @category constructors
 * @since 0.0.1
 */
export const scenario = Effect.fnUntraced(function* (feature, options, run) {
    const store = yield* make(feature, options);
    const result = yield* run(store);
    yield* store.finish;
    return result;
}, Effect.scoped);
//# sourceMappingURL=TestStore.js.map