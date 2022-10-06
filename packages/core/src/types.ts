import { Builtin, DeepPickWritable } from 'ts-gems';


export type EntityInput<T> = DeepNullableIfPartial<DeepPickWritable<T>>;
export type EntityOutput<T> = DeepNullableIfPartial<T>;

export type DeepNullableIfPartial<T> = _DeepNullableIfPartial<T>;
type _DeepNullableIfPartial<T> =
    T extends Builtin ? T
        : T extends Promise<infer U> ? Promise<DeepNullableIfPartial<U>>
            : T extends (infer U)[] ? DeepNullableIfPartial<U>[]
                : { [P in keyof T]?: DeepNullableIfPartial<Exclude<T[P], undefined>> | null };
