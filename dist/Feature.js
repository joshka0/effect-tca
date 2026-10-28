import * as Option from "effect/Option";
import { draftTransition, snapshot } from "./internal/draft.js";
import { createEffectContexts } from "./internal/effectContext.js";
import { actionRoute, makeDefinition, stateLens } from "./internal/feature.js";
import { normalize } from "./internal/featureEffect.js";
import { StoreError } from "./StoreError.js";
export function make(spec) {
    if (spec === undefined)
        return makeDefinition;
    const contexts = createEffectContexts(spec.actions);
    return {
        ...makeDefinition({
            initial: (input) => snapshot(spec.initial(input)),
            reduce: (state, action) => {
                const tag = action._tag;
                const reduce = typeof spec.reduce === "function" ? spec.reduce : spec.reduce[tag];
                return draftTransition(state, (draft) => reduce(draft, action, contexts[tag]));
            },
        }),
        prepare: snapshot,
        actions: spec.actions,
    };
}
/**
 * Routes a tagged case whose only fields are `_tag` and `action`.
 * For other shapes, supply a Route with explicit extract and embed functions.
 * @category constructors
 * @since 0.0.1
 */
export const tag = () => (key) => actionRoute(key);
const rebase = (effect, path, embed) => {
    const operation = normalize(effect);
    const rebasedPath = [...path, ...operation.path];
    return operation._tag === "Cancel"
        ? { ...operation, path: rebasedPath }
        : {
            ...operation,
            path: rebasedPath,
            run: (send) => operation.run((action) => send(embed(action))),
        };
};
const register = (self, key) => {
    if (self.routes.includes(key))
        throw StoreError.make({ reason: "Reducer", message: `Duplicate child route: ${key}` });
    return [...self.routes, key];
};
const prepareChildren = (parent, child, visit) => {
    if (child === undefined)
        return parent;
    return (state) => {
        parent?.(state);
        visit(state, child);
    };
};
export function child(options) {
    if (options === undefined)
        return (options) => child(options);
    const state = stateLens(options.state);
    const action = actionRoute(options.action);
    return Object.assign((self) => ({
        ...self,
        prepare: prepareChildren(self.prepare, options.feature.prepare, (current, prepare) => prepare(state.get(current))),
        routes: register(self, action.key),
        lifetimes: (current) => [
            ...self.lifetimes(current),
            ...options.feature.lifetimes(state.get(current)).map((path) => [action.key, ...path]),
        ],
        reduce: (current, incoming) => {
            const selected = action.extract(incoming);
            if (Option.isNone(selected))
                return self.reduce(current, incoming);
            const result = options.feature.reduce(state.get(current), selected.value);
            const parent = self.reduce(state.replace(result.state, current), incoming);
            return {
                state: parent.state,
                effects: [
                    ...(result.effects ?? []).map((effect) => rebase(effect, [action.key], action.embed)),
                    ...(parent.effects ?? []),
                ],
            };
        },
    }), {
        _tag: "Child",
        select: (current) => Option.some(state.get(current)),
        embed: action.embed,
        path: () => Option.some([action.key]),
    });
}
export function optionalChild(options) {
    if (options === undefined)
        return (options) => optionalChild(options);
    const state = stateLens(options.state);
    const action = actionRoute(options.action);
    const path = (current) => [action.key, options.identity?.(current) ?? "present"];
    return Object.assign((self) => ({
        ...self,
        prepare: prepareChildren(self.prepare, options.feature.prepare, (current, prepare) => {
            const selected = state.get(current);
            if (Option.isSome(selected))
                prepare(selected.value);
        }),
        routes: register(self, action.key),
        lifetimes: (current) => {
            const selected = state.get(current);
            return [
                ...self.lifetimes(current),
                ...(Option.isSome(selected)
                    ? options.feature
                        .lifetimes(selected.value)
                        .map((tail) => [...path(selected.value), ...tail])
                    : []),
            ];
        },
        reduce: (current, incoming) => {
            const selected = action.extract(incoming);
            if (Option.isNone(selected))
                return self.reduce(current, incoming);
            const childState = state.get(current);
            if (Option.isNone(childState))
                throw StoreError.make({
                    reason: "MissingChild",
                    message: `Child ${action.key} is absent`,
                });
            const result = options.feature.reduce(childState.value, selected.value);
            const parent = self.reduce(state.replace(Option.some(result.state), current), incoming);
            return {
                state: parent.state,
                effects: [
                    ...(result.effects ?? []).map((effect) => rebase(effect, path(childState.value), action.embed)),
                    ...(parent.effects ?? []),
                ],
            };
        },
    }), {
        _tag: "OptionalChild",
        select: state.get,
        embed: action.embed,
        path: (current) => Option.map(state.get(current), path),
    });
}
export function forEach(options) {
    if (options === undefined)
        return (options) => forEach(options);
    const state = stateLens(options.state);
    const action = actionRoute(options.action);
    return Object.assign((self) => ({
        ...self,
        prepare: prepareChildren(self.prepare, options.feature.prepare, (current, prepare) => {
            for (const entry of state.get(current).values())
                prepare(entry);
        }),
        routes: register(self, action.key),
        lifetimes: (current) => [
            ...self.lifetimes(current),
            ...Array.from(state.get(current), ([id, value]) => options.feature.lifetimes(value).map((path) => [action.key, id, ...path])).flat(),
        ],
        reduce: (current, incoming) => {
            const selected = action.extract(incoming);
            if (Option.isNone(selected))
                return self.reduce(current, incoming);
            const { id, action: childAction } = selected.value;
            const entries = state.get(current);
            if (!entries.has(id))
                throw StoreError.make({
                    reason: "MissingChild",
                    message: `Child ${action.key}/${id} is absent`,
                });
            // Map.has above distinguishes a missing entry from a valid undefined state.
            const result = options.feature.reduce(entries.get(id), childAction);
            const updated = new Map(entries);
            updated.set(id, result.state);
            const parent = self.reduce(state.replace(updated, current), incoming);
            return {
                state: parent.state,
                effects: [
                    ...(result.effects ?? []).map((effect) => rebase(effect, [action.key, id], (child) => action.embed({ id, action: child }))),
                    ...(parent.effects ?? []),
                ],
            };
        },
    }), {
        _tag: "ForEach",
        at: (id) => ({
            _tag: "OptionalChild",
            select: (current) => {
                const entries = state.get(current);
                return entries.has(id) ? Option.some(entries.get(id)) : Option.none();
            },
            embed: (child) => action.embed({ id, action: child }),
            path: (current) => state.get(current).has(id) ? Option.some([action.key, id]) : Option.none(),
        }),
    });
}
//# sourceMappingURL=Feature.js.map