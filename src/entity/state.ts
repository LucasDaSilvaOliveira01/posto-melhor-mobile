export class State {
  public static fromJson(json: any): State[] {
    if (json === undefined) {
      return [];
    }
    const states: State[] = [];
    for (const state of json) {
      states.push(new State(state.id, state.name, state.initials));
    }

    return states;
  }

  private _id: string;
  private _name: string;
  private _initials: string;

  constructor(id: string, name: string, initial: string) {
    this._id = id;
    this._name = name;
    this._initials = initial;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get initials(): string {
    return this._initials;
  }
}
