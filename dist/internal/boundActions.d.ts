import type * as Schema from "effect/Schema";
import type { BoundActions, Store } from "../Store.ts";
export declare const bindActions: <S, A, Cases extends Record<string, Schema.Schema<NoInfer<A>>>>(store: Store<S, A>, actions: Schema.TaggedUnion<Cases>) => BoundActions<Cases>;
