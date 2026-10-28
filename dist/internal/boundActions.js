import * as Effect from "effect/Effect";
export const bindActions = (store, actions) => 
// Each entry keeps its case's constructor input; Object.fromEntries erases that mapping.
Object.fromEntries(Object.entries(actions.cases).map(([tag, schema]) => [
    tag,
    (payload = {}) => Effect.suspend(() => Effect.flatMap(schema.makeEffect({ ...payload, _tag: tag }), store.send)),
]));
//# sourceMappingURL=boundActions.js.map