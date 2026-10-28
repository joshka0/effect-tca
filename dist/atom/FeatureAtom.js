import * as Atom from "effect/reactivity/Atom";
import { makeBinding, scopeBinding, } from "../internal/featureAtom.js";
import * as Store from "../Store.js";
/**
 * Binds a feature to an application Atom runtime. Define bindings outside render.
 * Subscriptions and dispatch hold the store; after the last is released it is
 * disposed immediately. Separate registries receive independent stores.
 * Dispatch is asynchronous. Use a local draft for React controlled text inputs.
 * @category constructors
 * @since 0.0.1
 */
export const bind = (feature, options) => {
    const session = options.runtime.atom(Store.make(feature, options)).pipe(Atom.setIdleTTL(0));
    return makeBinding(session);
};
export function scope(binding, focus) {
    return scopeBinding(binding, focus);
}
//# sourceMappingURL=FeatureAtom.js.map