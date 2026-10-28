import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Atom from "effect/reactivity/Atom";
import * as Stream from "effect/Stream";
import * as Store from "../Store.js";
import { StoreError } from "../StoreError.js";
export const SessionTypeId = Symbol.for("effect-tca/atom/session");
export const makeBinding = (session) => {
    const state = Atom.make((get) => Stream.unwrap(Effect.map(get.result(session), (store) => store.changes))).pipe(Atom.setIdleTTL(0));
    const send = Atom.fn(Effect.fnUntraced(function* (action, get) {
        get.mount(session);
        const store = yield* get.result(session);
        yield* store.send(action);
    }), { concurrent: true }).pipe(Atom.setIdleTTL(0));
    return { state, send, [SessionTypeId]: session };
};
export const scopeBinding = (binding, focus) => {
    const parent = binding[SessionTypeId];
    if (focus._tag === "Child") {
        const session = Atom.make((get) => Effect.flatMap(get.result(parent), (store) => Store.scope(store, focus))).pipe(Atom.setIdleTTL(0));
        return makeBinding(session);
    }
    // A binding is stable within one mounted lifetime. Weak keys allow removed
    // children and their closures to be released once consumers drop them.
    const children = new WeakMap();
    return Atom.make((get) => Stream.unwrap(Effect.map(get.result(parent), (store) => store.changes.pipe(Stream.mapEffect(() => Store.scope(store, focus)), Stream.map(Option.map((child) => {
        const existing = children.get(child);
        if (existing !== undefined)
            return existing;
        // Reading the parent session retains its owning store while this child
        // has subscribers, even if the presence atom is no longer mounted.
        const session = Atom.make((get) => Effect.flatMap(get.result(parent), (current) => current === store
            ? Effect.succeed(child)
            : Effect.fail(StoreError.make({
                reason: "MissingChild",
                message: "The scoped child belongs to a different parent store or registry",
            })))).pipe(Atom.setIdleTTL(0));
        const selected = makeBinding(session);
        children.set(child, selected);
        return selected;
    })), Stream.changesWith((left, right) => Option.isNone(left)
        ? Option.isNone(right)
        : Option.isSome(right) && left.value === right.value))))).pipe(Atom.setIdleTTL(0));
};
//# sourceMappingURL=featureAtom.js.map