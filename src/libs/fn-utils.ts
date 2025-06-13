export function compose<T>(...fns: Array<(arg: T) => T>): (input: T) => T {
  return (input: T) => fns.reduceRight((acc, fn) => fn(acc), input);
}
