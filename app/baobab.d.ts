interface Baobab_Static {
    new<T>(obj: T):IBaobab<T>;
}
interface IBaobab<T> {
  get(): T;
  on(event: string, callback: any): void;
}

declare var baobab: Baobab_Static;

export = baobab;
