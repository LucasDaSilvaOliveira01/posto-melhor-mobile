import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA, Inject, ChangeDetectorRef } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { AlertController, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { Subscription, of, finalize, throwError, mergeMap, fromEvent } from 'rxjs';
import { AppComponent } from '../app.component';
import { Configuration } from '../../entity/configration';
import { ParameterEnum } from '../../entity/parameter-enum';
import { Service } from '../../entity/service';
import { GasStationProvider } from '../../providers/gas-station/gas-station';
import { ConnectionDialogPage } from '../connection-dialog/connection-dialog.page';
import { CustomDialogPage } from '../custom-dialog/custom-dialog.page';
import { GpsDialogPage } from '../gps-dialog/gps-dialog.page';
import { ListPriceGasStationPage } from '../list-price-gas-station/list-price-gas-station.page';
import { IonNav } from '@ionic/angular/common';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { SharedDataService } from '../services/shared-data.service';
//import { Diagnostic } from '@ionic-native/diagnostic';

/**
 * Generated class for the FilterServiceLocationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-filter-service-location',
  templateUrl: 'filter-service-location.page.html',
  styleUrls: ['../filter-product-location/filter-product-location.page.scss'],
  providers: [IonNav]
})
export class FilterServiceLocationPage implements OnInit, OnDestroy {
  private static readonly MESSAGE_ERROR_TITLE = 'OPS ...';
  private static readonly MESSAGE_ERROR_PRODUCT = 'Selecione um serviço.';
  private static readonly ALERT_BUTTON_TEXT = 'OK';
  private static readonly DEFAULT_TIMEOUT_GPS = 10000;
  private static readonly MAXIMUM_AGE = 30000;
  private static readonly ENABLE_GPS_HIGH_ACCURACY = true;
  private static readonly EMPTY_ARRAY = 0;

  public selectedService!: any;
  public services: Service[] = [];
  public minDistance: string = "0";
  public maxDistance: string = "31000";

  public formattedMinDistance: string = "0";
  public formattedMaxDistance: string = "31000";
  public formattedStructure: any = 1750;

  public isConnected: boolean = true;
  public structure: any = 1750;
  public configuration: Configuration | undefined;
  public defaultClass: string = 'no-scroll';
  private myLocation!: { latitude: number; longitude: number };
  private locationOptions: any;
  private subscriptions: Subscription[] = [];
  private isModalOpen: boolean = false;
  private gpsModal: any;

  constructor(
    public ionNav: IonNav,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    // private geo: Geolocation,
    private platform: Platform,
    //public diagnostic: Diagnostic,
    public configProvider: ConfigurationProvider,
    public gasProvider: GasStationProvider,
    private cdr: ChangeDetectorRef,
    public sharedDataService: SharedDataService
  ) {}

  public ngOnInit(): void {
    this.init();
  }

  public ngOnDestroy(): void {
    this.disposeSubscription();
  }

  public async searchGasStations() {

    const coordenada = await this.getCurrentPosition();

    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage
    });

    await waitingModal.present();

    this.gasProvider
      .getGasStationByLocationService(
        coordenada.coords.latitude,
        coordenada.coords.longitude,
        this.structure,
        this.selectedService
      )
      .pipe(finalize(() => {
        waitingModal.dismiss();
      }))
      .subscribe(
        value => {

          this.sharedDataService.setGasStationsObj(
            value,
            this.structure,
            this.selectedService,
            "Serviços",
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

  public async presentWaitingModal() {
    const waitingModal = await this.modalCtrl.create({
      component: CustomDialogPage});
    await waitingModal.present();

    this.gasProvider
      .getGasStationByLocationProduct(
        this.myLocation.latitude,
        this.myLocation.longitude,
        this.structure,
        this.selectedService
      )
      .pipe(finalize(() => {
        waitingModal.dismiss();
      }))
      .subscribe(
        value => {
          this.ionNav.setRoot(ListPriceGasStationPage, {
            gasStations: value,
            maxDistance: this.structure,
            selectedProduct: this.selectedService,
            title: 'Preços de combustíveis'
          });
        },
        error => {
          console.error(error);
        }
      );
  }


  public onChangeServiceSelect(selectedService: any) {
    this.selectedService = selectedService;
  }

  public async validateForm() {
    this.tryGetPosition();

    if (this.selectedService == null) {
      this.presentAlert(FilterServiceLocationPage.MESSAGE_ERROR_TITLE, FilterServiceLocationPage.MESSAGE_ERROR_PRODUCT);
      return;
    }

    if (this.myLocation.latitude === 0 && this.myLocation.longitude === 0) {
      this.changeValueModalOpen(false);
      this.showGpsModal();
      return;
    }

    if (this.isConnected) {
      this.presentWaitingModal();

      return;
    }

    const connectionModal =  await this.modalCtrl.create({component: ConnectionDialogPage});
    connectionModal.onDidDismiss();
    connectionModal.present();
  }

  private async presentAlert(title: string, subtitle: string) {
    const alert = await this.alertCtrl.create({
      buttons: [ {
        handler: () => {
          alert.dismiss().then(() => this.enableScroll());
          return false;
        },
        text: FilterServiceLocationPage.ALERT_BUTTON_TEXT
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

  private watchGps() {
    const temp =  of(Geolocation.watchPosition(this.locationOptions));

    const subs = temp
      .pipe.arguments(
      ( value: { coords: { latitude: number; longitude: number; }; }) => {
        this.checkStatusGps(() => {
          if (value && value.coords) {
            this.myLocation.latitude = value.coords.latitude;
            this.myLocation.longitude = value.coords.longitude;
          }
        });
      },
      ( error2: any) => {
        console.log(error2);
      }
    );

    this.subscriptions.push(subs);
  }

  private async tryGetPosition() {
    const tempLocation =  of(Geolocation.getCurrentPosition(this.locationOptions));

    const temp = tempLocation
      .pipe.arguments((value: Geoposition) =>
        this.configProvider.getAddressByGeolocationComplete(value.coords.latitude, value.coords.longitude)
      )

      if (temp! && temp.coords && temp.coords.latitude) {
      this.myLocation.latitude = temp.coords.latitude;
      this.myLocation.longitude = temp.coords.longitude;
    }
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


  private async checkStatusGps(callback?: () => void) {
    try {
      const coordenada = await Geolocation.getCurrentPosition();
      }
    catch{console.log('Erro na localização');
        this.showGpsModal();
      };
    }

  private setupGeolocationOptions() {
    this.locationOptions = {
      enableHighAccuracy: FilterServiceLocationPage.ENABLE_GPS_HIGH_ACCURACY,
      maximumAge: FilterServiceLocationPage.MAXIMUM_AGE,
      timeout: FilterServiceLocationPage.DEFAULT_TIMEOUT_GPS
    };
  }

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

  private async init() {
    await this.platform.ready();
    // this.createModals();
    this.checkStatusGps(() => null);
    this.setupGeolocationOptions();
    this.collectSubscriptions();
    this.setupLocation();
    await this.setupMockData();
    // this.watchGps();
    // this.getDefaultService();
  }

  private async setupMockData() {
    // this.services = AppComponent.services;

    this.configProvider.getDefaultServices().subscribe(data => {
      this.services = data

      this.cdr.detectChanges();
    });
    
    if (this.services.length > 0) {
      this.selectedService = this.services[0].id;
    }

    if (AppComponent.parameters && AppComponent.parameters.length > 0) {
      let temp = AppComponent.parameters.filter(value => value.id === ParameterEnum.MIN_DISTANCE_LOCALIZATION);
      this.minDistance = temp[0].value;

      temp = AppComponent.parameters.filter(value => value.id === ParameterEnum.MAX_DISTANCE_LOCALIZATION);
      this.maxDistance = temp[0].value;

      this.structure = Math.round((Number(this.maxDistance) - Number(this.minDistance)) / 2 + Number(this.minDistance));
    }

    if (this.structure != null) {
      this.formattedStructure = Number(this.structure).toFixed(3).replace(',', '.');
    }

    if (this.minDistance != null) {
      this.formattedMinDistance = Number(this.minDistance).toFixed(3).replace(',', '.');
    }

    if(this.maxDistance != null) {
      this.formattedMaxDistance = Number(this.minDistance).toFixed(3).replace(',', '.');
    }
  }

  onChangeStructure(event: any) {
    this.structure = event.target.valueAsNumber; // Atualiza o valor de structure com o valor do input
    this.cdr.detectChanges();
  }

  private setupLocation() {
    this.myLocation = {
      latitude: 0,
      longitude: 0
    };
  }

  private disposeSubscription() {
    if (this.subscriptions && this.subscriptions.length === FilterServiceLocationPage.EMPTY_ARRAY) {
      return;
    }

    for (const subscription of this.subscriptions) {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }

  private getDefaultService() {
    const service = this.services.filter(value => value.isDefault)
    this.selectedService = service[0].id;
  }
}
