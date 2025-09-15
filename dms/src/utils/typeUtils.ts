type DeepMutable<T> = T extends object
  ? {
      -readonly [K in keyof T]: DeepMutable<T[K]>;
    }
  : T;

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

export type MappedOmit<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] };

export function narrowedValue<const T>(value: T) {
  return value as DeepMutable<T>;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const UNSAFE_CAST = <T>(value: unknown) => {
  return value as T;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-explicit-any
export const UNSAFE_PROPERTY_ACCESS = <T>(object: any, key: PropertyKey) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return object[key] as T;
};
