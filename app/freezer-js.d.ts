interface Freezer_Static {
    new<T>(obj: T, options?: { live: boolean }):IFreezer<T>;
}
interface IFreezer<T> {
  get(): T;
  on(event: string, callback: any): void;
  toJS(): T;
}

declare var freezer: Freezer_Static;

export = freezer;
