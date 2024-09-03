import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { Parameter } from '../../entity/parameter';
import { Product } from '../../entity/product';
import { Service } from '../../entity/service';
import { State } from '../../entity/state';
import { GasStation } from '../../entity/gas-station'

import { GasStationProvider } from '../providers/gas-station/gas-station';

import { SharedDataService } from '../services/shared-data.service';

interface AllData {
  parameters: Parameter[];
  products: Product[];
  services: Service[];
  states: State[];
  gasStations: GasStation[];
}

@Component({
  selector: 'app-mock',
  templateUrl: './mock.page.html',
  styleUrls: ['./mock.page.scss']
})
export class MockPage implements OnInit, OnDestroy {

  private static readonly ALERT_BUTTON_TEXT = 'Tentar novamente';
  private static readonly TITLE = 'Posto Melhor';
  private static readonly MESSAGE = 'Não foi possível baixar todos os dados, verifique sua conexão e tente novamente!';

  private observables: Subscription = new Subscription();

  constructor(
    public navCtrl: NavController,
    private configProvider: ConfigurationProvider,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private gasStationProvider: GasStationProvider,
    public sharedDataService: SharedDataService
  ) {
  }

  async ngOnInit() {
    await this.loadAllData();
  }

  ngOnDestroy() {
    this.observables.unsubscribe();
  }

  private loadAllData() {

    this.loadingController.create({
      message: 'Carregando informações, aguarde...'
    }).then(load => {
      load.present().then(() => {
        this.observables = forkJoin({
          parameters: this.configProvider.getDefaultParameters() as Observable<Parameter[]>,
          products: this.configProvider.getDefaultProducts() as Observable<Product[]>,
          services: this.configProvider.getDefaultServices() as Observable<Service[]>,
          states: this.configProvider.getStates() as Observable<State[]>,
         
        }).subscribe({
          next: (data) => {
            load.dismiss().then(() => {
              if (data.products.length === 0 || data.parameters.length === 0 || data.services.length === 0 || data.states.length === 0) {
                // this.alert();
                // return;
              }  
              
              this.navCtrl.navigateRoot('/map');
            });
          },
          error: () => {
            load.dismiss().then(() => {
              this.alert();
            });
          }
        });
      });
    });
  }

  private async alert() {
    const alert = await this.alertController.create({
      header: MockPage.TITLE,
      subHeader: MockPage.MESSAGE,
      buttons: [
        {
          text: MockPage.ALERT_BUTTON_TEXT,
          handler: () => {
            this.loadAllData();
          }
        }
      ]
    });

    await alert.present();
  }
}
