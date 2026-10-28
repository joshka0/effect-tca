import * as Effect from "effect/Effect";
import * as SchemaParser from "effect/SchemaParser";
import * as FeatureEffect from "../FeatureEffect.js";
const none = { _tag: "None" };
const createSenderFactory = (schema) => {
    const factories = Object.keys(schema.cases).map((tag) => {
        // Cache each case's constructor once, while keeping payload validation lazy.
        const makeAction = SchemaParser.makeEffect(schema.cases[tag]);
        return [
            tag,
            (send) => (payload = {}) => Effect.suspend(() => Effect.flatMap(Effect.orDie(makeAction({ ...payload, _tag: tag })), send)),
        ];
    });
    return (send) => 
    // Object.fromEntries erases the mapped action keys and payload signatures.
    Object.fromEntries(factories.map(([tag, makeSender]) => [tag, makeSender(send)]));
};
/** One context and cancellation identity per case, shared across reducer calls. */
export const createEffectContexts = (schema) => {
    const createSenders = createSenderFactory(schema);
    const keys = new Map(Object.keys(schema.cases).map((tag) => [tag, Symbol(tag)]));
    const createRun = (key) => {
        function run(body) {
            return {
                _tag: "Run",
                key,
                run: (send) => Effect.suspend(() => {
                    const result = body(createSenders(send));
                    return Effect.isEffect(result) ? result : Effect.gen(() => result);
                }),
                path: [],
            };
        }
        return run;
    };
    const run = createRun();
    const cancel = (tag) => {
        const key = keys.get(tag);
        if (key === undefined)
            throw new Error(`Unknown action case: ${String(tag)}`);
        return FeatureEffect.cancel({ cancellationKey: key });
    };
    // Object.fromEntries erases the keys retained by the schema's case record.
    return Object.fromEntries(Array.from(keys, ([tag, key]) => [
        tag,
        {
            none,
            run,
            replace: createRun(key),
            cancel,
        },
    ]));
};
//# sourceMappingURL=effectContext.js.map