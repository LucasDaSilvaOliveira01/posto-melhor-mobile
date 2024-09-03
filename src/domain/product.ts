export class Product {
  get flag(): any {
    return this._flagId;
  }

  set flag(value: any) {
    this._flagId = value;
  }

  get name(): string {
    return this._name;
  }

  get value(): number | undefined {
    return this._value;
  }

  get id(): string {
    return this._id;
  }

  get isDefault(): boolean {
    return this._default;
  }

  set default(value: boolean) {
    this._default = value;
  }

  public static fromJson(json: any): Product {
    const value = json.price === undefined ? 0 : json.price === undefined ? 0 : json.price;
    const id = json.id ? json.id : json.product_id;
    const product = new Product(id, json.name, value);
    product.default = json.product_default;

    return product;
  }

  public static getDefault(): Product {
    return new Product("", "Gasolina Comun", 0);
  }

  private _id: string;
  private _flagId: any;
  private _name: string;
  private _value?: number;
  private _default: boolean = false;

  constructor(id: string, name: string, value?: number) {
    this._id = id;
    this._name = name;
    this._value = value;
  }
}
