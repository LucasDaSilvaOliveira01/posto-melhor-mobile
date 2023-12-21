export class Neighborhood {
  public static fromJson(json: any): Neighborhood[] {
    const neighborhoods: Neighborhood[] = [];
    for (const neighborhood of json) {
      neighborhoods.push(new Neighborhood(neighborhood.id, neighborhood.name, neighborhood.city_id));
    }

    return neighborhoods;
  }

  private _id: number;
  private _name: string;
  private _city: string;

  constructor(id: number, name: string, city: string) {
    this._id = id;
    this._name = name;
    this._city = city;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get city(): string {
    return this._city;
  }
}
