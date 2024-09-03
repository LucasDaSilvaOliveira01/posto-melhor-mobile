export class City {
  public static fromJson(json: any): City[] {
    const cities: City[] = [];
    for (const city of json) {
      cities.push(new City(city.id, city.state_id, city.name));
    }

    return cities;
  }

  private _id: number;
  private _state: string;
  private _name: string;

  constructor(id: number, state: string, name: string) {
    this._id = id;
    this._state = state;
    this._name = name;
  }

  get id(): number {
    return this._id;
  }

  get state(): string {
    return this._state;
  }

  get name(): string {
    return this._name;
  }
}
