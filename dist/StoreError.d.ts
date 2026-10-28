/**
 * Observable store and assertion failures.
 * @since 0.0.1
 */
import * as Schema from "effect/Schema";
declare const StoreError_base: Schema.Class<StoreError, Schema.TaggedStruct<"StoreError", {
    readonly reason: Schema.Literals<readonly ["Closed", "Reducer", "Effect", "Assertion", "MissingChild"]>;
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Unknown>;
}>, import("effect/Cause").YieldableError & {
    readonly brand: unique symbol;
}>;
/**
 * The store is closed, a reducer or effect failed, or a TestStore assertion failed.
 * `cause` retains the original failure for local diagnostics.
 * @category errors
 * @since 0.0.1
 */
export declare class StoreError extends StoreError_base {
}
export {};
