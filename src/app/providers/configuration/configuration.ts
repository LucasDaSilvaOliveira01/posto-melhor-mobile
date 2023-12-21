import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, map } from 'rxjs/operators';
import { Observable, pipe, of } from 'rxjs';
import { URL } from '../../app/constants';
import { City } from '../../entity/city';
import { Neighborhood } from '../../entity/neighborhood';
import { Parameter } from '../../entity/parameter';
import { Product } from '../../entity/product';
import { Service } from '../../entity/service';
import { State } from '../../entity/state';

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

declare var google: any;

@Injectable()
export class ConfigurationProvider {
  constructor(public http: HttpClient) {}

  public getDefaultParameters(): Observable<Parameter[]> {
    const parse = map((response: any) => response.data);
    const flat = mergeMap((value: any) => {
      const params: Parameter[] = [];
      for (const param of value) {
        params.push(Parameter.fromJson(param));
      }

      return of(params);
    });

    return this.http.get(`${URL}parameters`).pipe(
      parse,
      flat
    );
  }

  public getDefaultProducts(): Observable<Product[]> {
    const flat = mergeMap((value: any) => {
      const products: Product[] = [];
      for (const product of value) {
        products.push(Product.fromJson(product));
      }

      return of(products);
    });
    
    return this.http.get(`${URL}products`).pipe(flat);
  }

  public getDefaultServices(): Observable<Service[]> {
    const flat = mergeMap((value: any) => {
      const services: Service[] = [];
      for (const service of value) {
        services.push(Service.fromJson(service));
      }

      return of(services);
    });

    return this.http.get(`${URL}services`).pipe(flat);
  }

  public getAddressByGeolocation(latitude: number, longitude: number): Observable<string> {
    return new Observable<string>(observer => {
      const geocoder = new google.maps.Geocoder();
      const latLng = new google.maps.LatLng(latitude, longitude);

      geocoder.geocode({ location: latLng }, (results : any, status : any) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          const address = results[0].address_components[1].short_name;
          const city = results[0].address_components[3].short_name;
          const state = results[0].address_components[4].short_name;
          const fullAddress = `${address} / ${city} - ${state}`;
          observer.next(fullAddress);
          observer.complete();
        } else {
          observer.error('Geocoding failed');
        }
      });
    });
  }

  public getAddressByGeolocationComplete(latitude: number, longitude: number): Observable<any> {
    return new Observable(observer => {
      const geocoder = new google.maps.Geocoder();
      const latLng = new google.maps.LatLng(latitude, longitude);

      geocoder.geocode({ latLng }, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
          observer.next(results);
          observer.complete();
        } else {
          observer.error("");
      }
      });
    });
  }

  public getStates(): Observable<State[]> {
    const parse = map((response: any) => response.data);
    const flat = mergeMap((value: any) => {
      const states = State.fromJson(value);

      return of(states);
    });
    const join = pipe(
      parse,
      flat
    );

    return this.http.get(`${URL}states`).pipe(join);
  }

  public getCitiesByState(state: string): Observable<City[]> {
    const parse = map((response: any) => response.data);
    const flat = mergeMap((value: any) => {
      const cities = City.fromJson(value);

      return of(cities);
    });
    const join = pipe(
      parse,
      flat
    );

    return this.http.get(`${URL}cities/${state}`).pipe(join);
  }

  public getNeighborhoodsByCity(cityId: number): Observable<Neighborhood[]> {
    const parse = map((response: any) => response.data);
    const flat = mergeMap((value: any) => {
      const neighborhoods = Neighborhood.fromJson(value);

      return of(neighborhoods);
    });
    const join = pipe(
      parse,
      flat
    );

    return this.http.get(`${URL}neighborhoods/${cityId}`).pipe(join);
  }
}
