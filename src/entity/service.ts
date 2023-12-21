export class Service {
  public static fromJson(json: any): Service {
    const id = json.id ? json.id : json.service_id;
    const start = json.schedule ? json.schedule.name : json.start_date;
    const service = new Service(id, json.name, start, json.end_time);
    service.default = json.default_service;

    return service;
  }

  private _id: string;
  private _name: string;
  private _startTime: string;
  private _endTime: string | undefined;
  private _default: boolean;

  constructor(id: string, name: string, startTime: string, endTime?: string, defaultVal?: boolean) {
    this._id = id;
    this._name = name;
    this._startTime = startTime;
    this._endTime = endTime;
    this._default = defaultVal || false;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get startTime(): string {
    return this._startTime;
  }

  get endTime(): string | undefined {
    return this._endTime;
  }

  get isDefault(): boolean {
    return this._default;
  }

  set default(value: boolean) {
    this._default = value;
  }
}
