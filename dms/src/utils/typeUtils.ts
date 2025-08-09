type DeepMutable<T> = T extends object
  ? {
      -readonly [K in keyof T]: DeepMutable<T[K]>;
    }
  : T;

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

export function narrowedValue<const T>(value: T) {
  return value as DeepMutable<T>;
}
