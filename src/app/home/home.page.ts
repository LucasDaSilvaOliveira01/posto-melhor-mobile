import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams, Platform } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { AppComponent } from '../../app/app.component';
import { ConfigurationProvider } from '../../providers/configuration/configuration';
import { zip } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit, OnDestroy {
  private static readonly ALERT_BUTTON_TEXT = 'Tentar novamente';
  private static readonly TITLE = 'Posto Melhor';
  private static readonly MESSAGE = 'Não foi possível baixar todos os dados, verifique sua conexão e tente novamente!';

  private observables: Subscription = new Subscription();

  public constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public configProvider: ConfigurationProvider,
    public loading: LoadingController,
    public alertCtrl: AlertController,
    private router: Router
  ) {   }

  public ngOnInit(): void {
    this.loadAllData();
  }
  public ngOnDestroy(): void {
    this.observables.unsubscribe();
  }

  private async loadAllData() {
    await this.platform.ready();

    const parametersObservable = this.configProvider.getDefaultParameters();
    const productsObservable = this.configProvider.getDefaultProducts();
    const servicesObservable = this.configProvider.getDefaultServices();
    const statesObservables = this.configProvider.getStates();

    const load = await this.loading.create({
      message: 'Carregando informações, aguarde...'
    });

    load.present();
    this.observables = zip(
      parametersObservable,
      productsObservable,
      servicesObservable,
      statesObservables
    ).subscribe(
      ([parameters, products, services, states]) => {
        AppComponent.products = products;
        AppComponent.parameters = parameters;
        AppComponent.services = services;
        AppComponent.states = states;
        load.dismiss().then(() => {
          if (products.length === 0 || parameters.length === 0 || services.length === 0 || states.length === 0) {
            this.alert();
            return;
          }
          this.navCtrl.navigateRoot('../map/map.page');
        });
      },
      () => {
        load.dismiss().then(() => {
          this.alert();
        });
      }
    );
  }

  private async alert() {
    const alert = await this.alertCtrl.create({
      buttons: [
        {
          handler: async () => {
            await alert.dismiss();
            this.loadAllData();
          },
          text: HomePage.ALERT_BUTTON_TEXT
        }
      ],
      subHeader: HomePage.MESSAGE,
      header: HomePage.TITLE
    });
    alert.present();
  }
}
