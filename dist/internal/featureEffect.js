import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
export function normalize(effect) {
    if (Effect.isEffect(effect)) {
        return { _tag: "Run", key: undefined, run: (send) => Effect.flatMap(effect, send), path: [] };
    }
    if (Stream.isStream(effect)) {
        return {
            _tag: "Run",
            key: undefined,
            run: (send) => Stream.runForEach(effect, send),
            path: [],
        };
    }
    return effect;
}
//# sourceMappingURL=featureEffect.js.map