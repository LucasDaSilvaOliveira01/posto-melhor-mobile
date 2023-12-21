import { Product } from './product';

import { Service } from './service';

import { City } from './city';

import { Neighborhood } from './neighborhood';

export class Configuration {
  constructor(
    distanceMinimum: number,
    distanceMaximum: number,
    products: Product[],
    services: Service[],
    cities: City[],
    neighborhoods: Neighborhood[]
  ) {
    this._distanceMinimum = distanceMinimum;
    this._distanceMaximum = distanceMaximum;
    this._products = products;
    this._services = services;
    this._cities = cities;
    this._neighborhoods = neighborhoods;
  }

  private _distanceMinimum: number;

  get distanceMinimum(): number {
    return this._distanceMinimum;
  }

  private _distanceMaximum: number;

  get distanceMaximum(): number {
    return this._distanceMaximum;
  }

  private _products: Product[];

  get products(): Product[] {
    return this._products;
  }

  private _services: Service[];

  get services(): Service[] {
    return this._services;
  }

  private _cities: City[];

  get cities(): City[] {
    return this._cities;
  }

  private _neighborhoods: Neighborhood[];

  get neighborhoods(): Neighborhood[] {
    return this._neighborhoods;
  }

  static fromJson(json: any): Configuration {
    let cities: City[] = [];
    for (let city of json.cidades) {
      cities.push(city);
    }

    let neighborhoods: Neighborhood[] = Neighborhood.fromJson(json.bairros);

    let products: Product[] = [];
    for (let product of json.produtos) {
      products.push(Product.fromJson(product));
    }

    let services: Service[] = [];
    for (let service of json.servicos) {
      services.push(Service.fromJson(service));
    }

    return new Configuration(json.distancia_minima, json.distancia_maxima, products, services, cities, neighborhoods);
  }
}
