import { Injectable } from '@angular/core';

import { GasStation } from '../../entity/gas-station';
import { State } from '../../entity/state';
import { Product } from '../../entity/product';

import { Observable, of } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SharedDataService {

    latitude!: number;
    longitude!: number;

    products!: Product[];

    gasStations!: GasStation[];
    maxDistance!: any;
    selectedProduct: any
    title!: string;
    selectedCity: any;
    selectedNeighborhood: any;
    selectedState: any;

    static states: State[];

    // products!: Observable<Product[]>;

    constructor() { }

    setGasStationsObj(gasStations: GasStation[],
        maxDistance: any,
        selectedProduct: any,
        title: string,
        selectedCity: any,
        selectedNeighborhood: any,
        selectedState: any) {
        this.gasStations = gasStations;
        this.maxDistance = maxDistance;
        this.selectedProduct = selectedProduct;
        this.title = title;
        this.selectedCity = selectedCity;
        this.selectedNeighborhood = selectedNeighborhood;
        this.selectedState = selectedState;
    }

    // getProducts() {
    //     return this.products;
    // }

    getStations() {
        return this.gasStations;
    }
}
