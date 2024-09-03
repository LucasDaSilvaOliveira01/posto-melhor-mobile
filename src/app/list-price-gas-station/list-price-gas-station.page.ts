import { Component, OnInit, OnDestroy } from '@angular/core';

import { Geoposition } from '@ionic-native/geolocation';
import { NavController, NavParams, Platform } from '@ionic/angular';
import { Subscription, of } from 'rxjs';
import { AppComponent } from '../../app/app.component';
import { GasStation } from '../../entity/gas-station';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { GasStationProvider } from '../../providers/gas-station/gas-station';
import { MapPage } from '../map/map.page';
import { DecimalPipe } from '@angular/common';
import { IonNav } from '@ionic/angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { ApiService } from '../services/api-service.service';
import { SharedDataService } from '../services/shared-data.service';

/**
 * Generated class for the ListPriceGasStationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-list-price-gas-station',
  templateUrl: './list-price-gas-station.page.html',
  styleUrls: ['./list-price-gas-station.page.scss'],
  providers: [NavParams, GasStationProvider, ConfigurationProvider, DecimalPipe]
})

export class ListPriceGasStationPage implements OnInit, OnDestroy {
  private static readonly EMPTY_LIST = 0;
  private static readonly DEFAULT_FIRST_INDEX = 0;
  private static readonly LOCALE = 'en-US';
  private static readonly MINIMUM_FRACTION_DIGITS = 3;
  private static readonly LABEL_GAS_STATION_LOCATION = 'Postos em: ';
  private static readonly LABEL_GAS_STATION_MAX_DISTANCE = 'Distância máxima: ';
  private static readonly TYPE_MEASUREMENT = ' m';
  private static readonly DEFAULT_TIMEOUT_GPS = 10000;
  private static readonly ENABLE_GPS_HIGH_ACCURACY = true;
  private static readonly MAXIMUM_AGE = 30000;

  public selectedProduct: any = null;
  public selectedState: any = null;
  public selectedCity: any = null;
  public selectedNeighborhood: any = null;
  public title: any = null;
  public cityState: any;
  public maxDistance: any;
  items!: GasStation[];
  public myAddress: string = 'Pesquisando endereço, aguarde...';


  private locationOptions: any;
  private subscriptions: Subscription[] = [];

  // location!: {
  //   lat: number,
  //   long: number
  // };

  private latitude: number = 0;
  private longitude: number = 0;

  constructor(
    private navCtrl: NavController,
    public navParams: NavParams,
    public gasProvider: GasStationProvider,
    private configProvider: ConfigurationProvider,
    private platform: Platform,
    public decimal: DecimalPipe,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    public sharedDataService: SharedDataService,
    private route: ActivatedRoute,
  ) { }
  public ngOnInit(): void {
    this.setupProperty();
    this.init();
    // this.GetGasStations();
  }

  public ngOnDestroy() {
    if (this.subscriptions) {
      for (const subs of this.subscriptions) {
        subs.unsubscribe();
      }
    }
  }

  public showDistanceOrReference(item?: GasStation): string {
    if (this.maxDistance == null) {
      return item!.reference === null || item!.reference === '' ? '' : 'Referência: ';
    } else {
      return 'Distância: ';
    }
  }

  public showDistanceOrReferenceInfo(item: { reference: string; distance: number; }): string {
    if (this.maxDistance == null) {
      return item.reference;
    } else {
      return this.decimal.transform(this.roundValue(item.distance), '3.0')!.replace(',', '.') + 'm';
    }
  }

  public traceRoute(item: any, distance: any, lat: any, lng: any) {

    this.navCtrl.navigateRoot('/map', {
      state: {
        nav: true,
        gasStation: item,
        dist: distance,
        latitude: lat,
        longitude: lng
      }
    })

    // this.navCtrl.push(MapPage, {
    //   gasstationList: this.items,
    //   latitude: this.latitude,
    //   longitude: this.longitude,
    //   selectedGasstation: item
    // });

  }

  public showSelectedLocation(): string {
    if (this.maxDistance == null) {
      this.cityState = this.selectedCity + ' - ' + this.selectedState;


      return this.selectedNeighborhood == null
        ? ListPriceGasStationPage.LABEL_GAS_STATION_LOCATION + this.cityState
        : this.selectedNeighborhood + ', ' + this.cityState;

    } else {
      return (
        ListPriceGasStationPage.LABEL_GAS_STATION_MAX_DISTANCE +
        this.decimal.transform(this.roundValue(this.maxDistance), '3.0')!.replace(',', '.') +
        ListPriceGasStationPage.TYPE_MEASUREMENT
      );
    }
  }

  // public showCorrectProduct(index: number, value: string): string {
  //   const regex = new RegExp(value);
  //   const temp = this.items[index].products.filter(product => product.name.match(regex));

  //   const defaultProduct = this.items[index].products[ListPriceGasStationPage.DEFAULT_FIRST_INDEX].value;

  //   return temp.length === ListPriceGasStationPage.EMPTY_LIST
  //     ? this.items[index].products[ListPriceGasStationPage.DEFAULT_FIRST_INDEX].value
  //       .toLocaleString(ListPriceGasStationPage.LOCALE, {
  //         minimumFractionDigits: ListPriceGasStationPage.MINIMUM_FRACTION_DIGITS
  //       })
  //       .replace('.', ',')
  //     : temp[ListPriceGasStationPage.DEFAULT_FIRST_INDEX].value
  //       .toLocaleString(ListPriceGasStationPage.LOCALE, {
  //         minimumFractionDigits: ListPriceGasStationPage.MINIMUM_FRACTION_DIGITS
  //       })
  //       .replace('.', ',');
  // }

  public showCorrectProduct(index: number, value: string): string | void {
    const regex = new RegExp(value);
    const temp = this.items[index].products.filter(product => product.name.match(regex));

    if (temp.length === ListPriceGasStationPage.EMPTY_LIST) {
      const defaultProduct = this.items[index].products[ListPriceGasStationPage.DEFAULT_FIRST_INDEX];
      if (defaultProduct && defaultProduct.value !== undefined) {
        return defaultProduct.value
          .toLocaleString(ListPriceGasStationPage.LOCALE, {
            minimumFractionDigits: ListPriceGasStationPage.MINIMUM_FRACTION_DIGITS
          })
          .replace('.', ',');
      }
    } else {
      const firstProduct = temp[ListPriceGasStationPage.DEFAULT_FIRST_INDEX];
      if (firstProduct && firstProduct.value !== undefined) {
        return firstProduct.value
          .toLocaleString(ListPriceGasStationPage.LOCALE, {
            minimumFractionDigits: ListPriceGasStationPage.MINIMUM_FRACTION_DIGITS
          })
          .replace('.', ',');
      }
    }
  }


  public showServiceStartTime(index: number, value: string): string {
    const regex = new RegExp(value);
    const temp = this.items[index].services.filter(product => product.name.match(regex));

    return temp.length === ListPriceGasStationPage.EMPTY_LIST
      ? ''
      : temp[ListPriceGasStationPage.DEFAULT_FIRST_INDEX].startTime;
  }

  public showServiceEndTime(index: number, value: string): string | undefined {
    const regex = new RegExp(value);
    const temp = this.items[index].services.filter(product => product.name.match(regex));

    return temp.length === ListPriceGasStationPage.EMPTY_LIST
      ? ''
      : temp[ListPriceGasStationPage.DEFAULT_FIRST_INDEX].endTime;
  }

  public roundValue(value: number): number {
    return Math.round(value);
  }

  private async init() {
    await this.platform.ready();
    this.setupGeolocationOptions();
    this.getMyAddress();
  }

  private setupProperty() {
    
    this.title = this.sharedDataService.title;
    this.selectCorrectProduct(this.sharedDataService.selectedProduct);
    // this.selectedState = this.navParams.get('selectedState');

    this.selectedState = this.sharedDataService.selectedState == null
      ? null : this.sharedDataService.selectedState._initials;

    // this.selectedCity = this.navParams.get('selectedCity');
    this.selectedCity = this.sharedDataService.selectedCity == null
      ? null : this.sharedDataService.selectedCity._name;

    // this.selectedNeighborhood = this.navParams.get('selectedNeighborhood');
    this.selectedNeighborhood = this.sharedDataService.selectedNeighborhood == null
      ? null : this.sharedDataService.selectedNeighborhood._name;

    this.maxDistance = this.sharedDataService.maxDistance;
    this.items = this.sharedDataService.gasStations;
  }

  private selectCorrectProduct(id: string) {
    // const products = AppComponent.products.filter(value => value.id === id);
    // const services = AppComponent.services.filter(value => value.id === id);
    // let name = products[0] ? products[0].name : '';
    // if (this.title === 'Serviços') {
    //   name = services[0] ? services[0].name : '';
    // }
    // return name;

    if (this.title != 'Serviços') {
      this.configProvider.getDefaultProducts().subscribe(data => {
        this.selectedProduct = data.find(product => product.id == id)!.name;
      })
    } else if(this.title == 'Serviços') {
      this.configProvider.getDefaultServices().subscribe(data => {
        this.selectedProduct = data.find(product => product.id == id)!.name;
      })
    }
  }

  private setupGeolocationOptions() {
    this.locationOptions = {
      enableHighAccuracy: ListPriceGasStationPage.ENABLE_GPS_HIGH_ACCURACY,
      maximumAge: ListPriceGasStationPage.MAXIMUM_AGE,
      timeout: ListPriceGasStationPage.DEFAULT_TIMEOUT_GPS
    };
  }

  private async getMyAddress() {

    await this.loadGoogleMaps();

    const currentPosition = await this.getCurrentPosition();

    this.latitude = currentPosition.coords.latitude;
    this.longitude = currentPosition.coords.longitude;

    this.configProvider
      .getAddressByGeolocation(currentPosition.coords.latitude, currentPosition.coords.longitude)
      .subscribe(
        addressData => {
          this.myAddress = addressData;
          this.cdr.detectChanges();
        },
        error => {
          console.error('Erro ao obter dados de endereço:', error);
        }
      );

  }

  loadGoogleMaps(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiService.getApiKey()}&libraries=places`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  private async GetGasStations(): Promise<void> {
    if (!this.items) {
      this.items = [];
    }

    if (this.items) {
      const currentPosition = await this.getCurrentPosition();
      this.gasProvider.getGasStationsByGeolocation(currentPosition.coords.latitude, currentPosition.coords.longitude)
        .subscribe(
          data => {
            data.forEach(elem => {
              this.items.push(elem);
            });

            this.cdr.detectChanges();
          },
          error => {
            console.error('Erro ao obter dados de endereço:', error);
          }
        );
    } else {
      console.error('Erro: items não inicializado corretamente.');
    }
  }

  async getCurrentPositionPromise(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalização não suportada pelo navegador.');
      } else {
        try {

          const options: PositionOptions = {
            enableHighAccuracy: true, // Ativar alta precisão
            timeout: 30000, // Tempo limite
            maximumAge: 30000, // Forçar a obtenção de uma nova localização (sem usar cache)
          };
          navigator.geolocation.watchPosition(resolve, reject, options);
          // navigator.geolocation.getCurrentPosition(resolve, reject, options);
        }
        catch (e) { console.log(e); }
      }
    });
  }


}
