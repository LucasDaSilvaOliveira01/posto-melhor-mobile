import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject, ChangeDetectorRef } from '@angular/core';
//import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
// import { Geolocation, PositionError } from '@ionic-native/geolocation';
// import { ConnectionStatus, Network } from '@capacitor/network';

import { finalize, tap } from 'rxjs/operators';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform
} from '@ionic/angular';
import { Subscription, of, throwError, mergeMap, fromEvent } from 'rxjs';
//import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { AppComponent } from '../../app/app.component';
import { City } from '../../entity/city';
import { Neighborhood } from '../../entity/neighborhood';
import { Service } from '../../entity/service';
import { State } from '../../entity/state';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { GasStationProvider } from '../../providers/gas-station/gas-station';
import { ConnectionDialogPage } from '../connection-dialog/connection-dialog.page';
import { CustomDialogPage } from '../custom-dialog/custom-dialog.page';
import { GpsDialogPage } from '../gps-dialog/gps-dialog.page';
import { ListPriceGasStationPage } from '../list-price-gas-station/list-price-gas-station.page';
import { IonNav } from '@ionic/angular/common';
import { SharedDataService } from '../services/shared-data.service';

/**
 * Generated class for the FilterServiceCityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-filter-service-city',
  templateUrl: 'filter-service-city.page.html',
  styleUrls: ['../filter-product-city/filter-product-city.page.scss'],
  providers: [IonNav]
})
export class FilterServiceCityPage implements OnInit, OnDestroy {
  private static readonly MESSAGE_ERROR_TITLE = 'OPS ...';
  private static readonly MESSAGE_ERROR_PRODUCT = 'Selecione um serviço.';
  private static readonly MESSAGE_ERROR_STATE = 'Selecione um estado.';
  private static readonly MESSAGE_ERROR_CITY = 'Selecione um município.';
  private static readonly ALERT_BUTTON_TEXT = 'OK';
  private static readonly EMPTY_ARRAY = 0;
  private static readonly DEFAULT_SERVICE = 0;
  private static readonly DEFAULT_TIMEOUT_GPS = 10000;
  private static readonly ENABLE_GPS_HIGH_ACCURACY = true;
  private static readonly MAXIMUM_AGE = 30000;
  private static readonly MESSAGE_ERROR_GPS = 'Não foi possível obter seu endereço, preencha os campos manualmente.';
  private static readonly NAO_ENCONTRADO = -1;

  public states: State[] = [];
  public cities: City[] = [];
  public neighborhoods: Neighborhood[] = [];
  public selectedService: any;
  public services!: Service[];
  public selectedState: any = null;
  public selectedCity: any = null;
  public selectedNeighborhood: any = null;
  public Connection: any;
  public isConnected: boolean = true;
  public optionsCity: any = {};
  public optionsState: any = {};
  public optionsNeighborhood: any = {};
  public optionsService: any = {};
  public defaultClass: string = 'no-scroll';

  private subscriptions: Subscription[] = [];
  private locationOptions: any;
  private isModalOpen: boolean = false;
  private gpsModal: any;

  constructor(
    public ionNav: IonNav,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    // @Inject('network') private network: ConnectionStatus,
    public loadingCtrl: LoadingController,
    private configurationProvider: ConfigurationProvider,
    private gasProvider: GasStationProvider,
    public platform: Platform,
    public configProvider: ConfigurationProvider,
    private cdr: ChangeDetectorRef,
    public sharedDataService: SharedDataService
    //public diagnostic: Diagnostic
  ) {}

  public ngOnInit() {
    this.init();
  }

  public ngOnDestroy() {
    this.disposeSubscription();
  }

  public async presentWaitingModal() {
    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage});
    await waitingModal.present();

    this.gasProvider
      .getGasStationByAddressService(this.selectedService, this.selectedCity, this.selectedNeighborhood)
      .pipe(finalize(() => {
        waitingModal.dismiss();
        this.enableScroll();
      }))
      .subscribe(value => {
        const nameCity = this.getSelectedCity();
        const stateName = this.getSelectedState();
        const neighborhoodName = this.getSelectedNeighborhood();
        // this.ionNav.setRoot(ListPriceGasStationPage, {
        //   gasStations: value,
        //   maxDistance: null,
        //   selectedCity: nameCity,
        //   selectedNeighborhood: neighborhoodName,
        //   selectedProduct: this.selectedService,
        //   selectedState: stateName,
        //   title: 'Serviços'
        // });

        this.sharedDataService.setGasStationsObj(
          value,
          null,
          this.selectedService,
          "Serviços",
          nameCity,
          neighborhoodName,
          stateName);

        this.navCtrl.navigateRoot("/list-price-gas-station");

      });
  }

  public onChangeServiceSelect(selectedService: string) {
    this.selectedService = selectedService;
    this.enableScroll();
  }

  public async onChangeStateSelect(state: string) {
    this.selectedState = state;
    const loading = await this.loadingCtrl.create({
      message: 'Carregando cidades, aguarde...'
    });

    await loading.present();
    const subscription = this.configurationProvider
      .getCitiesByState(state)
      .pipe(tap(value => {
        if (value.length === 0) {
          this.genericAlertError();
        }
      }))
      .pipe(finalize(() => {
        loading.dismiss();
        this.enableScroll();
      }))
      .subscribe(
        ( cities: City[]) => {
          this.cities = cities;
          this.neighborhoods = [];

          this.cdr.detectChanges();
        },
        ( error: any) => this.genericAlertError()
      );

    this.subscriptions.push(subscription);
  }

  public async onChangeCitiesSelect(selectedCity: number) {
    this.selectedCity = selectedCity;
    const loading = await this.loadingCtrl.create({
      message: 'Carregando bairros, aguarde...'
    });
    await loading.present();

    const subs = this.configurationProvider
      .getNeighborhoodsByCity(selectedCity)
      .pipe(tap(value => {
        if (value.length === 0) {
          this.genericAlertError();
        }
      }))
      .pipe(finalize(() => {
        loading.dismiss();
        this.enableScroll();
      }))
      .subscribe(value => {
        this.neighborhoods = value
        this.cdr.detectChanges();
      }, error => this.genericAlertError());

    this.subscriptions.push(subs);
  }

  public onChangeNeighborhoodSelect(selectedNeighborhood: Neighborhood) {
    this.selectedNeighborhood = selectedNeighborhood;
    this.enableScroll();
  }

  public async validateForm() {
    if (this.selectedService == null) {
      this.presentAlert(FilterServiceCityPage.MESSAGE_ERROR_TITLE, FilterServiceCityPage.MESSAGE_ERROR_PRODUCT);
    } else if (this.selectedState == null) {
      this.presentAlert(FilterServiceCityPage.MESSAGE_ERROR_TITLE, FilterServiceCityPage.MESSAGE_ERROR_STATE);
    } else if (this.selectedCity == null) {
      this.presentAlert(FilterServiceCityPage.MESSAGE_ERROR_TITLE, FilterServiceCityPage.MESSAGE_ERROR_CITY);
    } else if (this.isConnected) {
      this.presentWaitingModal();
    } else {
      const connectionModal = await this.modalCtrl.create({component: ConnectionDialogPage});
    connectionModal.onDidDismiss();
    //connectionModal.onDidDismiss(data => this.enableScroll());
    connectionModal.present();
    }
  }

  private async init() {
    await this.platform.ready();

    // this.createModals();
    this.setupGeolocationOptions();
    this.setupListenerConnection();
    this.setupProperties();
    this.getDefaultService();
    this.checkStatusGps(() => this.initGps());
    this.enableScroll();
  }

  private enableScroll() {
    this.defaultClass = 'no-scroll';
    setTimeout(() => this.defaultClass = 'enable-scroll', 1000);
  }

  private async presentAlert(title: string, subtitle: string) {
    const alert = await this.alertCtrl.create({
      buttons: [ {
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterServiceCityPage.ALERT_BUTTON_TEXT
      }],
      subHeader: subtitle,
      header: title
    });
    alert.present();
  }

  private setupProperties() {
    // this.states = AppComponent.states;
    // this.services = AppComponent.services;

    this.configProvider.getStates().subscribe(data => {
      this.states = data

      this.cdr.detectChanges();
    });

    this.configProvider.getDefaultServices().subscribe(data => {
      this.services = data
      this.cdr.detectChanges();
    });

    if (this.services.length > FilterServiceCityPage.EMPTY_ARRAY) {
      this.selectedService = this.services[FilterServiceCityPage.DEFAULT_SERVICE].id;
    }

    this.optionsService = {
      title: 'Serviços'
    };

    this.optionsState = {
      title: 'UF'
    };

    this.optionsCity = {
      title: 'Cidades'
    };

    this.optionsNeighborhood = {
      title: 'Bairros'
    };
  }

  private setupListenerConnection() {
    const onlineEvent$ = fromEvent(window, 'online');

    const subsConnected = onlineEvent$.subscribe(() => {
      this.isConnected = true;
    });

    const offlineEvent$ = fromEvent(window, 'offline');

    const subsDisconnected = offlineEvent$.subscribe(() => {
      this.isConnected = false;
    });

    this.subscriptions.push(subsConnected);
    this.subscriptions.push(subsDisconnected);
  }

  private disposeSubscription() {
    if (this.subscriptions && this.subscriptions.length === FilterServiceCityPage.EMPTY_ARRAY) {
      return;
    }

    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }

  private genericAlertError() {
    this.presentAlert(FilterServiceCityPage.MESSAGE_ERROR_TITLE, 'Nenhum resultado encontrado.');
  }

  private getSelectedCity() {
    const citie = this.cities.find(value => value.id == this.selectedCity)!;
    return citie;
  }

  private getSelectedNeighborhood() {
    const neighborhood = this.neighborhoods.find(value => value.id == this.selectedNeighborhood);
    return neighborhood;
  }

  private getSelectedState() {
    const state = this.states.find(value => value.id == this.selectedState);
    return state;
  }

  private getDefaultService() {
    const service = this.services.filter(value => value.isDefault);
    this.selectedService = service[0].id;
  }

  private setupGeolocationOptions() {
    this.locationOptions = {
      enableHighAccuracy: FilterServiceCityPage.ENABLE_GPS_HIGH_ACCURACY,
      maximumAge: FilterServiceCityPage.MAXIMUM_AGE,
      timeout: FilterServiceCityPage.DEFAULT_TIMEOUT_GPS
    };
  }
  private async initGps() {
  let googleAddress: any = null;
    const loading = await this.loadingCtrl.create({
      message: 'Tentando obter sua localização, aguarde...'
    });
    await loading.present();

    const tempLocation =  of(Geolocation.getCurrentPosition(this.locationOptions));

    const sub = tempLocation
      .pipe.arguments((value: Geoposition) =>
        this.configProvider.getAddressByGeolocationComplete(value.coords.latitude, value.coords.longitude)
      )
      .flatMap((address: any) => {
        googleAddress = address;
        const state = address[0].address_components[4].short_name;
        const states = this.states.filter(
          value => value.initials.indexOf(state) !== FilterServiceCityPage.NAO_ENCONTRADO
        );

        if (states && states[0]) {
          this.selectedState = states[0].id;
          return of(states[0].id);
        }

        return throwError(() => new Error('State not found'));
      })
      .flatMap((state: string) => this.configurationProvider.getCitiesByState(state))
      .flatMap((cities: City[]) => {
        this.cities = cities;
        this.neighborhoods = [];
        const cityName = googleAddress[0].address_components[3].short_name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        const city = this.cities.filter(value => {
          const temp = value.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

          return temp.indexOf(cityName) !== FilterServiceCityPage.NAO_ENCONTRADO;
        });

        if (city && city[0]) {
          this.selectedCity = city[0].id;
          return of(city[0]);
        }

        return throwError(() => new Error('City not found'));
      })
      .finally(() => {
        loading.dismiss();
        this.enableScroll();
      })
      .subscribe(
        ( value: any) => {},
        ( error: any) => {
          console.error(error);
          loading.dismiss().then(() => this.showAlert());
        }
      );

    this.subscriptions.push(sub);
  }

  private async showAlert() {
    const alert = await this.alertCtrl.create({
      buttons: [ {
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterServiceCityPage.ALERT_BUTTON_TEXT
      }],
      subHeader: FilterServiceCityPage.MESSAGE_ERROR_GPS,
      header: FilterServiceCityPage.MESSAGE_ERROR_TITLE
    });
    alert.present().then();
  }

  private async checkStatusGps(callback?: () => void) {
    try {
      const coordenada = await Geolocation.getCurrentPosition();
      }
    catch{console.log('Erro na localização');
        this.showGpsModal();
      };
    }

  private showGpsModal() {
    if (this.getValueModalOpen() === false && this.getValueModalOpen() !== undefined) {
      this.changeValueModalOpen(true);
      this.gpsModal.present();
    }
  }

  private getValueModalOpen(): boolean {
    return this.isModalOpen;
  }

  private changeValueModalOpen(value: boolean) {
    this.isModalOpen = value;
  }

  private createModals() {
    this.gpsModal = this.modalCtrl.create({component: GpsDialogPage});
    this.gpsModal.onDidDismiss((data: any) => {
      this.enableScroll();
    });
  }

}
