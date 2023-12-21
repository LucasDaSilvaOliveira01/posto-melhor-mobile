export class Parameter {

  public get id(): number {
    return this._id;
  }

  public get description(): string {
    return this._description;
  }

  public get value(): string {
    return this._value;
  }

  public static fromJson(json: any): Parameter {
    return new Parameter(json.id, json.description, json.value);
  }

  private _id: number;
  private _description: string;
  private _value: string;

  constructor(id: number, description: string, value: string) {
    this._id = id;
    this._description = description;
    this._value = value;
  }

}
