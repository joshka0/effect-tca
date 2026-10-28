import * as Optic from "effect/Optic";
import * as Option from "effect/Option";
import { pipeArguments } from "effect/Pipeable";
import * as Predicate from "effect/Predicate";
export const makeDefinition = (spec) => ({
    ...spec,
    lifetimes: () => [[]],
    routes: [],
    pipe() {
        return pipeArguments(this, arguments);
    },
});
export const stateLens = (state) => Predicate.isPropertyKey(state)
    ? // Public options only admit keys whose value type matches the child state.
        Optic.id().key(state)
    : state;
export const actionRoute = (action) => {
    if (!Predicate.isString(action))
        return action;
    return {
        key: action,
        extract: (value) => {
            // Public options admit only tagged cases with exactly this action payload.
            const tagged = value;
            return tagged._tag === action ? Option.some(tagged.action) : Option.none();
        },
        embed: (value) => ({ _tag: action, action: value }),
    };
};
//# sourceMappingURL=feature.js.map