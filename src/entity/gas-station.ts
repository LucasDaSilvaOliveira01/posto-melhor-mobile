import { Product } from './product';
import { Service } from './service';

export class GasStation {
  public static fromStation(json: any): GasStation {
    const gasStation = new GasStation();
    gasStation.id = json.id;
    gasStation.name = json.fantasy_name;
    gasStation.address = json.street + ', ' + json.number;
    gasStation.logo = json.flag.logo ? json.flag.logo : 'assets/imgs/logo_app_color.png';
    gasStation.logoPin = json.flag.marker ? json.flag.marker : 'assets/imgs/default_pin.png';
    gasStation.distance = json.distance;
    gasStation.reference = json.reference_localization;
    gasStation.longitude = json.longitude;
    gasStation.latitude = json.latitude;
    gasStation.phone = json.telephones ? json.telephones[0].number : '';
    gasStation.product = new Product("0", "Gasolina Comun", 0);

    const products: Product[] = [];
    if (json.products) {
      for (const temp of json.products) {
        products.push(Product.fromJson(temp));
        GasStation.forceDefaultProduct(gasStation, temp);
      }
    }

    const services: Service[] = [];
    if (json.services) {
      for (const temp of json.services) {
        services.push(Service.fromJson(temp));
      }
    }

    gasStation.products = products;
    gasStation.services = services;

    return gasStation;
  }

  public static fromJson(json: any): GasStation {
    const gasStation = new GasStation();
    gasStation.name = json.name;
    gasStation.address = json.address;
    gasStation.logo = json.img;
    gasStation.logoPin = json.pin;
    gasStation.distance = json.distance;
    gasStation.reference = json.reference;
    gasStation.longitude = json.longitude;
    gasStation.latitude = json.latitude;
    gasStation.phone = json.phone;

    const products: Product[] = [];
    for (const temp of json.products) {
      products.push(Product.fromJson(temp));
    }

    const services: Service[] = [];
    for (const temp of json.services) {
      services.push(Service.fromJson(temp));
    }

    gasStation.products = products;
    gasStation.services = services;

    return gasStation;
  }

  private static forceDefaultProduct(gasStation: GasStation, product: any) {
    if (product.product_default) {
      gasStation.product = product;
    }
  }

  private _id: string;
  private _name: string;
  private _logo: string;
  private _address: string;
  private _logoPin: string;
  private _distance: number;
  private _reference: string;
  private _latitude: number;
  private _longitude: number;
  private _phone: string;
  private _products: Product[];
  private _services: Service[];
  private _currentProduct: Product;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get logo(): string {
    return this._logo;
  }

  set logo(value: string) {
    this._logo = value;
  }

  get address(): string {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
  }

  get logoPin(): string {
    return this._logoPin;
  }

  set logoPin(value: string) {
    this._logoPin = value;
  }

  get distance(): number {
    return this._distance;
  }

  set distance(value: number) {
    this._distance = value;
  }

  set reference(value: string) {
    this._reference = value;
  }
  get reference(): string {
    return this._reference;
  }

  get latitude(): number {
    return this._latitude;
  }

  set latitude(value: number) {
    this._latitude = value;
  }

  get longitude(): number {
    return this._longitude;
  }

  set longitude(value: number) {
    this._longitude = value;
  }

  get phone(): string {
    return this._phone;
  }

  set phone(value: string) {
    this._phone = value;
  }

  get products(): Product[] {
    return this._products;
  }

  set products(value: Product[]) {
    this._products = value;
  }

  get services(): Service[] {
    return this._services;
  }

  set services(value: Service[]) {
    this._services = value;
  }

  get product(): Product {
    return this._currentProduct;
  }

  set product(value: Product) {
    this._currentProduct = value;
  }
}
