import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject, Inject, ChangeDetectorRef } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { AlertController, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { Subscription, of, finalize, fromEvent } from 'rxjs';
import { ParameterEnum } from '../../entity/parameter-enum';
import { Product } from '../../entity/product';
import { GasStationProvider } from '../../providers/gas-station/gas-station';
import { ConnectionDialogPage } from '../connection-dialog/connection-dialog.page';
import { CustomDialogPage } from '../custom-dialog/custom-dialog.page';
import { GpsDialogPage } from '../gps-dialog/gps-dialog.page';
import { ListPriceGasStationPage } from '../list-price-gas-station/list-price-gas-station.page';
import { IonNav } from '@ionic/angular/common';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { ApiService } from '../services/api-service.service';
import { SharedDataService } from '../services/shared-data.service';

// import { Diagnostic } from '@ionic-native/diagnostic';

/**
 * Generated class for the FilterProductLocationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-filter-product-location',
  templateUrl: './filter-product-location.page.html',
  styleUrls: ['./filter-product-location.page.scss'],
  providers: [IonNav, NavParams, GasStationProvider, ConfigurationProvider]
})
export class FilterProductLocationPage implements OnInit, OnDestroy {
  private static readonly MESSAGE_ERROR_TITLE = 'OPS ...';
  private static readonly MESSAGE_ERROR_PRODUCT = 'Selecione um produto.';
  private static readonly ALERT_BUTTON_TEXT = 'OK';
  private static readonly DEFAULT_TIMEOUT_GPS = 10000;
  private static readonly ENABLE_GPS_HIGH_ACCURACY = true;
  private static readonly MAXIMUM_AGE = 30000;

  public selectedProduct: string = "";
  public products: Product[] = [];
  public minDistance: string = "Carregando...";

  public formattedMinDistance: any = "0";
  public formattedMaxDistance: any = "2000";
  public formattedStructure: any = 1750;

  public maxDistance: string = "Carregando...";
  public isConnected: boolean = true;
  public structure: any = 1750;
  public defaultClass: string = 'no-scroll';
  private myLocation!: { latitude: number; longitude: number };
  private subscriptions: Subscription[] = [];
  private locationOptions: any;
  private isModalOpen: boolean = false;
  private gpsModal: any;

  constructor(
    public ioNav: IonNav,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private gasProvider: GasStationProvider,
    public configProvider: ConfigurationProvider,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    public sharedDataService: SharedDataService
  ) { }
  public ngOnInit(): void {
    this.init();
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      for (const subs of this.subscriptions) {
        subs.unsubscribe();
      }
    }
  }

  public onChangeProductSelect(selectedProduct: string) {
    this.selectedProduct = selectedProduct;
  }

  public async searchGasStations() {

    const coordenada = await this.getCurrentPosition();

    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage
    });

    await waitingModal.present();

    this.gasProvider
      .getGasStationByLocationProduct(
        coordenada.coords.latitude,
        coordenada.coords.longitude,
        this.structure,
        this.selectedProduct
      )
      .pipe(finalize(() => {
        waitingModal.dismiss();
      }))
      .subscribe(
        value => {

          this.sharedDataService.setGasStationsObj(
            value,
            this.structure,
            this.selectedProduct,
            "Preços de combustíveis",
            null,
            null,
            null);

          this.navCtrl.navigateRoot("/list-price-gas-station");

        },
        error => {
          console.error(error);
        }
      );
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

  public async validateForm() {
    // await this.tryGetPosition();

    // if (this.selectedProduct == null) {
    //   this.presentAlert(FilterProductLocationPage.MESSAGE_ERROR_TITLE, FilterProductLocationPage.MESSAGE_ERROR_PRODUCT);
    //   return;
    // }

    // if (this.myLocation.latitude === 0 && this.myLocation.longitude === 0) {
    //   this.changeValueModalOpen(false);
    //   this.showGpsModal();
    //   return;
    // }

    // Essa linha redireciona para a página de listas de gasStations passando as informações necessárias
    // if (this.isConnected) {
    //   this.presentWaitingModal();
    //   return;
    // }

    // const connectionModal = await this.modalCtrl.create({ component: ConnectionDialogPage });
    // connectionModal.onDidDismiss();
    // connectionModal.present();
  }

  private setupLocation() {
    this.myLocation = {
      latitude: 0,
      longitude: 0
    };
  }
  private setupMockData() {
    this.configProvider.getDefaultProducts().subscribe(data => {
      this.products = data;
      if (this.products.length > 0) {
        this.selectedProduct = this.products[0].id;
      }
      this.cdr.detectChanges();
    });

    this.configProvider.getDefaultParameters().subscribe(data => {
      this.minDistance = data.find(param => param.id == ParameterEnum.MIN_DISTANCE_LOCALIZATION)!.value;
      this.maxDistance = data.find(param => param.id == ParameterEnum.MAX_DISTANCE_LOCALIZATION)!.value;

      this.cdr.detectChanges();
    });

    // if (AppComponent.parameters && AppComponent.parameters.length > 0) {
    //   let temp = AppComponent.parameters.filter(value => value.id === ParameterEnum.MIN_DISTANCE_LOCALIZATION);
    //   this.minDistance = temp[0].value;

    //   temp = AppComponent.parameters.filter(value => value.id === ParameterEnum.MAX_DISTANCE_LOCALIZATION);
    //   this.maxDistance = temp[0].value;

    //   this.structure = Math.round((Number(this.maxDistance) - Number(this.minDistance)) / 2 + Number(this.minDistance));
    // }

    // if (this.structure != null) {
    //   this.formattedStructure = Number(this.structure).toFixed(0).replace(',', '.');
    // }

    // if (this.minDistance != null) {
    //   this.formattedMinDistance = Number(this.minDistance).toFixed(0).replace(',', '.');
    // }

    // if (this.maxDistance != null) {
    //   this.formattedMaxDistance = Number(this.maxDistance).toFixed(0).replace(',', '.');
    // }
  }

  onChangeStructure(event: any) {
    this.structure = event.target.valueAsNumber; // Atualiza o valor de structure com o valor do input
    this.cdr.detectChanges();
  }

  public async presentWaitingModal() {
    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage
    });
    await waitingModal.present();

    this.gasProvider
      .getGasStationByLocationProduct(
        this.myLocation.latitude,
        this.myLocation.longitude,
        this.structure,
        this.selectedProduct
      )
      .pipe(finalize(() => {
        waitingModal.dismiss();
      }))
      .subscribe(
        value => {
          this.ioNav.setRoot(ListPriceGasStationPage, {
            gasStations: value,
            maxDistance: this.structure,
            selectedProduct: this.selectedProduct,
            title: 'Preços de combustíveis'
          });
        },
        error => {
          console.error(error);
        }
      );
  }

  private async presentAlert(title: string, subtitle: string) {
    const alert = await this.alertCtrl.create({
      buttons: [{
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterProductLocationPage.ALERT_BUTTON_TEXT
      }],
      subHeader: subtitle,
      header: title
    });
    alert.present();
  }
  private enableScroll() {
    this.defaultClass = 'no-scroll';
    setTimeout(() => this.defaultClass = 'enable-scroll', 1000);
  }

  private async init() {
    await this.platform.ready();
    // await this.createModals();
    this.checkStatusGps(() => null);
    this.setupGeolocationOptions();
    this.collectSubscriptions();
    this.setupLocation();
    this.setupMockData();
    this.watchGps();
    this.setDefaultProduct();
  }

  private async watchGps() {


    const currentPosition = await Geolocation.getCurrentPosition();
    this.checkStatusGps(() => {

      this.myLocation.latitude = currentPosition.coords.latitude;
      this.myLocation.longitude = currentPosition.coords.longitude;

    });
  }

  // private async watchGps() {
  //   const temp = of(Geolocation.watchPosition(this.locationOptions));
  //   const subs = temp
  //     .pipe.arguments(
  //       (value: { coords: { latitude: number; longitude: number; }; }) => {
  //         this.checkStatusGps(() => {
  //           this.myLocation.latitude = value.coords.latitude;
  //           this.myLocation.longitude = value.coords.longitude;
  //         });
  //       },
  //       (error2: any) => {
  //         console.log(error2);
  //       }
  //     );
  //   this.subscriptions.push(subs);
  // }

  private collectSubscriptions() {
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

  private setupGeolocationOptions() {
    this.locationOptions = {
      enableHighAccuracy: FilterProductLocationPage.ENABLE_GPS_HIGH_ACCURACY,
      maximumAge: FilterProductLocationPage.MAXIMUM_AGE,
      timeout: FilterProductLocationPage.DEFAULT_TIMEOUT_GPS
    };
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

  private async createModals() {
    this.gpsModal = await this.modalCtrl.create({ component: GpsDialogPage });

    this.gpsModal.present();
    this.gpsModal.onDidDismiss((data: any) => {
      this.enableScroll();
    });
  }

  private async tryGetPosition() {
    const coordenada = await Geolocation.getCurrentPosition();

    const temp = this.configProvider.getAddressByGeolocationComplete(coordenada.coords.latitude, coordenada.coords.longitude)
    temp.subscribe(data => {
      if (temp! && data && data.latitude) {
        this.myLocation.latitude = data.latitude;
        this.myLocation.longitude = data.longitude;
      }
    })

  }

  private setDefaultProduct() {
    const temp = this.products.filter(value => value.isDefault);
    if (temp.length > 0) {
      this.selectedProduct = temp[0].id;
    }
  }
}
