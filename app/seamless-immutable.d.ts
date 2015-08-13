interface Seamless_Static {
    <T>(obj: T):ISeamless<T>;
}
interface ISeamless<T> {
  get(): T;
  on(event: string, callback: any): void;
}

declare var seamless: Seamless_Static;

export = seamless;
