import { normalize } from "./internal/featureEffect.js";
export function withSend(program) {
    return { _tag: "Run", key: undefined, run: program, path: [] };
}
export function replace(options, program) {
    if (program === undefined)
        return (program) => replace(options, program);
    return { ...normalize(program), key: options.cancellationKey };
}
/**
 * Stops work with this feature-local cancellation key and rejects its queued actions.
 * A missing key is a no-op. Cleanup may continue after the cancelling action commits.
 * @category constructors
 * @since 0.0.1
 */
export const cancel = (options) => ({
    _tag: "Cancel",
    key: options.cancellationKey,
    path: [],
});
//# sourceMappingURL=FeatureEffect.js.map