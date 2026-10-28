/**
 * Scoped runtimes for feature definitions.
 * @since 0.0.1
 */
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { bindActions as bindActionSenders } from "./internal/boundActions.js";
import { makeStore, ScopeTypeId } from "./internal/store.js";
import { StoreError } from "./StoreError.js";
/**
 * Captures the feature's dependencies and runs it within the caller's scope.
 * Reducer and effect defects close the store; expected failures belong in actions.
 * Invalid capacity or a throwing initializer fails with StoreError.
 * @category constructors
 * @since 0.0.1
 */
export const make = makeStore;
/**
 * Derives named senders from an action schema. Each returned Effect applies
 * constructor defaults, validates the payload, and waits for the action to
 * commit through this store. Schema failures do not dispatch. Binding or calling
 * a sender does no work; scoped senders retain their original child lifetime.
 * @category combinators
 * @since 0.0.1
 */
export const bindActions = bindActionSenders;
export function scope(store, focus) {
    const selected = store[ScopeTypeId](focus);
    return focus._tag === "Child"
        ? Effect.flatMap(selected, Option.match({
            onNone: () => Effect.fail(StoreError.make({ reason: "MissingChild", message: "Child is absent" })),
            onSome: Effect.succeed,
        }))
        : selected;
}
//# sourceMappingURL=Store.js.map