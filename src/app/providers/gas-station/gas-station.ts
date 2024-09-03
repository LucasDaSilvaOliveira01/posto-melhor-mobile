import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { Observable, pipe, of } from 'rxjs';
import { URL } from '../../constants';
import { GasStation } from '../../../entity/gas-station';
import { GasStationMap } from '../../../entity/gas-station-response';

/*
  Generated class for the GasStationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GasStationProvider {
  constructor(public http: HttpClient) {
    console.log('Hello GasStationProvider Provider');
  }

  public getGasStationsByGeolocation(latitude: number, longitude: number): Observable<GasStation[]> {
    const parse = mergeMap((value: any) => {
      console.log('by location', value);
      const items: GasStation[] = [];
      for (const gas of value.stations) {
        const parsed = GasStation.fromStation(gas);
        items.push(parsed);
      }
      return of(items);
      // return Observable.of(items);
    });
    
    return this.http
        .get(`${URL}stations-initial?latitude=${latitude}&longitude=${longitude}`)
        .pipe(parse);
  }

  public getGasStationById(id: string, latitude: number, longitude: number): Observable<GasStation> {
    const flat = mergeMap((value: any) => {
      return of(GasStation.fromStation(value));
    });

    return this.http.get(`${URL}stations/${id}?latitude=${latitude}&longitude=${longitude}`).pipe(flat);
  }

  public getGasStationByLocationProduct(
    latitude: number,
    longitude: number,
    radius: number,
    productId: string
  ): Observable<GasStation[]> {
    const parse = mergeMap((value: any) => {
      const items: GasStation[] = [];
      for (const gas of value) {
        const parsed = GasStation.fromStation(gas);
        items.push(parsed);
      }
      return of(items);
    });

    return this.http
      .get(
        `${URL}stations-location-products?latitude=${latitude}&longitude=${longitude}&raio=${radius}&produto=${productId}`
      )
      .pipe(parse);
  }

  public getGasStationByAddressProduct(
    productId: string,
    cityId: string,
    neighborhoodId?: string
  ): Observable<GasStation[]> {
    const parse = mergeMap((value: any) => {
      console.log('by address', value);
      const items: GasStation[] = [];
      for (const gas of value) {
        const parsed = GasStation.fromStation(gas);
        items.push(parsed);
      }
      return of(items);
    });
    
    const url = neighborhoodId
      ? `${URL}stations-city-products?product_id=${productId}&city_id=${cityId}&neighborhood_id=${neighborhoodId}`
      : `${URL}stations-city-products?product_id=${productId}&city_id=${cityId}`;

    return this.http.get(url).pipe(parse);
  }

  public getGasStationByAddressService(
    serviceId: string,
    cityId: string,
    neighborhoodId: string
  ): Observable<GasStation[]> {
    const parse = mergeMap((value: any) => {
      const items: GasStation[] = [];
      for (const gas of value) {
        const parsed = GasStation.fromStation(gas);
        items.push(parsed);
      }
      return of(items);
    });
    const join = pipe(parse);

    const url = neighborhoodId
      ? `${URL}stations-city-services?service_id=${serviceId}&city_id=${cityId}&neighborhood_id=${neighborhoodId}`
      : `${URL}stations-city-services?service_id=${serviceId}&city_id=${cityId}`;

    return this.http.get(url).pipe(parse);
  }

  public getGasStationByLocationService(
    latitude: number,
    longitude: number,
    radius: number,
    serviceId: string
  ): Observable<GasStation[]> {
    const parse = mergeMap((value: any) => {
      const items: GasStation[] = [];
      for (const gas of value) {
        const parsed = GasStation.fromStation(gas);
        items.push(parsed);
      }
      return of(items);
    });
    const join = pipe(parse);

    return this.http
      .get(
        `${URL}stations-location-services?latitude=${latitude}&longitude=${longitude}&raio=${radius}&servico=${serviceId}`
      )
      .pipe(parse);
  }
}
