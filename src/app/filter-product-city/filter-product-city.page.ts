import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
/* Importado do código antigo e modificado */
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { AlertController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { Subscription, of, throwError, mergeMap, fromEvent } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { City } from '../../entity/city';
import { Neighborhood } from '../../entity/neighborhood';
import { Product } from '../../entity/product';
import { State } from '../../entity/state';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { GasStationProvider } from '../../providers/gas-station/gas-station';
import { ConnectionDialogPage } from '../connection-dialog/connection-dialog.page';
import { CustomDialogPage } from '../custom-dialog/custom-dialog.page';

import { GpsDialogPage } from '../gps-dialog/gps-dialog.page';
import { ListPriceGasStationPage } from '../list-price-gas-station/list-price-gas-station.page';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { IonNav } from '@ionic/angular/common';
import { SharedDataService } from '../services/shared-data.service';


/* a serem modificadas - dentro do comentário funções que precisam ser convertidas
import { ErrorObservable } from 'rxjs/observable/ErrorObservable'; - trocar para throwError - feito
import { Diagnostic } from '@ionic-native/diagnostic';
*/

@Component({
  selector: 'app-filter-product-city',
  templateUrl: './filter-product-city.page.html',
  styleUrls: ['./filter-product-city.page.scss'],
  providers: [IonNav]
})

export class FilterProductCityPage implements OnInit, OnDestroy {
  private static readonly MESSAGE_ERROR_TITLE = 'OPS...';
  private static readonly MESSAGE_ERROR_PRODUCT = 'Selecione um produto.';
  private static readonly MESSAGE_ERROR_STATE = 'Selecione um estado.';
  private static readonly MESSAGE_ERROR_CITY = 'Selecione um município.';
  private static readonly ALERT_BUTTON_TEXT = 'OK';
  private static readonly DEFAULT_TIMEOUT_GPS = 10000;
  private static readonly ENABLE_GPS_HIGH_ACCURACY = true;
  private static readonly MAXIMUM_AGE = 30000;
  private static readonly MESSAGE_ERROR_GPS = 'Não foi possível obter seu endereço, preencha os campos manualmente.';
  private static readonly NAO_ENCONTRADO = -1;

  public cities: City[] = [];
  public products: Product[] = [];
  public states: State[] = [];
  public neighborhoods: any;
  public selectedProduct: any;
  public selectedState: any = null;
  public selectedCity: any = null;
  public selectedNeighborhood: any = null;
  public Connection: any;
  public isConnected: boolean = true;
  public defaultClass: string = 'no-scroll';

  private subscriptions: Subscription[] = [];
  private locationOptions: any;
  private isModalOpen: boolean = false;
  private gpsModal: any;

  constructor(
    public ionNav: IonNav,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public configurationProvider: ConfigurationProvider,
    public gasProvider: GasStationProvider,
    public platform: Platform,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public sharedDataService: SharedDataService
  ) { }

  ngOnInit() {
    this.init();
  }
  public ngOnDestroy() {
    if (!this.subscriptions || this.subscriptions.length === 0) {
      return;
    }

    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }

  public async presentWaitingModal() {
    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage
    });
    await waitingModal.present();

    const subscription = this.gasProvider
      .getGasStationByAddressProduct(this.selectedProduct, this.selectedCity, this.selectedNeighborhood)
      .pipe(finalize(() => {
        waitingModal.dismiss();
        this.enableScroll();
      }))
      .subscribe(
        value => {
          const nameCity = this.getSelectedCity();
          const stateName = this.getSelectedState();
          const neighborhoodName = this.getSelectedNeighborhood();

          // this.ionNav.setRoot(ListPriceGasStationPage, {
          //   gasStations: value,
          //   maxDistance: null,
          //   selectedCity: nameCity,
          //   selectedNeighborhood: neighborhoodName,
          //   selectedProduct: this.selectedProduct,
          //   selectedState: stateName,
          //   title: 'Preços de combustíveis'
          // });

          this.sharedDataService.setGasStationsObj(
            value,
            null,
            this.selectedProduct,
            "Preços de combustíveis",
            nameCity,
            neighborhoodName,
            stateName);

          this.navCtrl.navigateRoot("/list-price-gas-station");
        },
        error => console.error(error)
      );

    this.subscriptions.push(subscription);
  }

  public onChangeProductSelect(selectedProduct: string) {
    this.selectedProduct = selectedProduct;
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
        (cities: City[]) => {
          this.cities = cities;
          this.neighborhoods = [];
          
          this.cdr.detectChanges();
        },
        (error: any) => this.genericAlertError()
      );

    this.subscriptions.push(subscription);
  }

  public async onChangeCitySelect(city: number) {
    this.selectedCity = city;
    const loading = await this.loadingCtrl.create({
      message: 'Carregando bairros, aguarde...'
    });
    await loading.present();

    const subscription = this.configurationProvider
      .getNeighborhoodsByCity(city)
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
        (value: any) => {
          this.neighborhoods = value;
          
          this.cdr.detectChanges();
        },
        (error: any) => this.genericAlertError()
      );

    this.subscriptions.push(subscription);
  }

  public onChangeNeighborhoodSelect(neighborhood: Neighborhood) {
    this.selectedNeighborhood = neighborhood;
    this.enableScroll();
  }

  public async validateForm() {
    if (this.selectedProduct == null) {
      this.presentAlert(FilterProductCityPage.MESSAGE_ERROR_TITLE, FilterProductCityPage.MESSAGE_ERROR_PRODUCT);
      return;
    }

    if (this.selectedState == null) {
      this.presentAlert(FilterProductCityPage.MESSAGE_ERROR_TITLE, FilterProductCityPage.MESSAGE_ERROR_STATE);
      return;
    }

    if (this.selectedCity == null) {
      this.presentAlert(FilterProductCityPage.MESSAGE_ERROR_TITLE, FilterProductCityPage.MESSAGE_ERROR_CITY);
      return;
    }
    if (this.isConnected) {
      this.presentWaitingModal();
      return;
    }

    const connectionModal = await this.modalCtrl.create({ component: ConnectionDialogPage });
    connectionModal.onDidDismiss();
    //connectionModal.onDidDismiss(data => this.enableScroll());
    connectionModal.present();
  }

  private async init() {
    await this.platform.ready();
    // this.createModals();
    this.setupGeolocationOptions();
    this.initListenerInternet();
    await this.setupProperties();
    this.getDefaultProduct();
    this.checkStatusGps(() => this.initGps());
    this.enableScroll();
  }

  private enableScroll() {
    this.defaultClass = 'no-scroll';
    setTimeout(() => this.defaultClass = 'enable-scroll', 1000);
  }

  private initListenerInternet() {
    const onlineEvent$ = fromEvent(window, 'online');

    const connected = onlineEvent$.subscribe(() => {
      this.isConnected = true;
    });

    const offlineEvent$ = fromEvent(window, 'offline');

    const disconnected = offlineEvent$.subscribe(() => {
      this.isConnected = false;
    });

    this.subscriptions.push(connected);
    this.subscriptions.push(disconnected);
  }

  private setupProperties() {
    this.configurationProvider.getDefaultProducts().subscribe(data => {
      this.products = data
    this.cdr.detectChanges();
    });

    this.configurationProvider.getStates().subscribe(data => {
      this.states = data
      this.cdr.detectChanges();
    });

  }

  private getDefaultProduct() {
    const products = this.products.filter(value => value.isDefault);
    if (products.length > 0) {
      this.selectedProduct = products[0].id;
    }
  }

  private async presentAlert(title: string, subtitle: string) {
    const alert = await this.alertCtrl.create({
      buttons: [{
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterProductCityPage.ALERT_BUTTON_TEXT
      }],
      subHeader: subtitle,
      header: title
    });
    alert.present();
  }

  private getSelectedCity() {
    const citie = this.cities.find(value => value.id == this.selectedCity)!;
    return citie
  }

  private getSelectedNeighborhood() {
    const neighborhood = this.neighborhoods.find((value : { id: any; })=> value.id == this.selectedNeighborhood)!;
    return neighborhood;
  }

  private getSelectedState() {
    const state = this.states.find(value => value.id == this.selectedState)!;
    return state;
  }

  private genericAlertError() {
    this.presentAlert(FilterProductCityPage.MESSAGE_ERROR_TITLE, 'Nenhum resultado encontrado.');
  }

  private setupGeolocationOptions() {
    this.locationOptions = {
      enableHighAccuracy: FilterProductCityPage.ENABLE_GPS_HIGH_ACCURACY,
      maximumAge: FilterProductCityPage.MAXIMUM_AGE,
      timeout: FilterProductCityPage.DEFAULT_TIMEOUT_GPS
    };
  }

  private async initGps() {
    let googleAddress: any = null;
    const loading = await this.loadingCtrl.create({
      message: 'Tentando obter sua localização, aguarde...'
    });
    await loading.present();

    const tempLocation = of(Geolocation.getCurrentPosition(this.locationOptions));

    const sub = tempLocation
      .pipe.arguments((value: Geoposition) =>
        this.configurationProvider.getAddressByGeolocationComplete(value.coords.latitude, value.coords.longitude)
      )
      .flatMap((address: any) => {
        googleAddress = address;
        const state = address[0].address_components[4].short_name;
        const states = this.states.filter(
          value => value.initials.indexOf(state) !== FilterProductCityPage.NAO_ENCONTRADO
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

          return temp.indexOf(cityName) !== FilterProductCityPage.NAO_ENCONTRADO;
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
        (value: any) => { },
        (error: any) => {
          console.error(error);
          loading.dismiss().then(() => this.showAlert());
        }
      );

    this.subscriptions.push(sub);
  }

  private async showAlert() {
    const alert = await this.alertCtrl.create({
      buttons: [{
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterProductCityPage.ALERT_BUTTON_TEXT
      }],
      subHeader: FilterProductCityPage.MESSAGE_ERROR_GPS,
      header: FilterProductCityPage.MESSAGE_ERROR_TITLE
    });
    alert.present().then();
  }

  private async checkStatusGps(callback?: () => void) {
    try {
      const coordenada = await Geolocation.getCurrentPosition();
    }
    catch {
      console.log('Erro na localização');
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
    this.gpsModal = this.modalCtrl.create({ component: GpsDialogPage });
    this.gpsModal.onDidDismiss((data: any) => {
      this.enableScroll();
    });
  }

  dismiss() {
    this.router.navigate(['home']);
  }
}
