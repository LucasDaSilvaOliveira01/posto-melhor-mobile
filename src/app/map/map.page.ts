import { ChangeDetectorRef, Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { ConfigurationProvider } from '../providers/configuration/configuration'
import { GasStationProvider } from '../providers/gas-station/gas-station';
import { SharedDataService } from '../services/shared-data.service'

import { ModalController, NavController } from '@ionic/angular';
import { GasStation } from '../../entity/gas-station';
import { ApiService } from '../services/api-service.service';
import { Product } from '../../entity/product';
import { Service } from '../../entity/service';
import { ListPriceGasStationPage } from '../list-price-gas-station/list-price-gas-station.page';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage implements OnInit {

  private static readonly DEFAULT_LATITUDE = -23.4486138;
  private static readonly DEFAULT_LONGITUDE = -51.9472739;
  defaultLocation = { lat: MapPage.DEFAULT_LATITUDE, lng: MapPage.DEFAULT_LONGITUDE };

  showStations: boolean = true;
  arrowRotation: string = '180deg';
  arrowRotationLeft: string = '0deg';
  currentLocation: string = '';
  gasStations!: GasStation[];
  loadedGasStations: boolean = false;
  stationsMarkers: Marker[] = [];

  products: Product[] = [];

  latitude: number = -23.4486138;
  longitude: number = -51.9472739;

  opcaoSelecionada: string = 'Gasolina Comun';
  produtoDisponivel: boolean = false;

  showStationProducts: boolean = true;
  showStationServices: boolean = false;

  stationsCard: boolean = true;
  productsServicesCard: boolean = false;

  gasStationProducts: Product[] | undefined;
  gasStationServices: GasStation[] | undefined;
  stationServices: Service[] | undefined;

  servicesLoadedGasStations: boolean = false;
  latGasStation: number | undefined;
  longGasStation: number | undefined;
  nameGasStation: string = "Carregando...";
  refGasStation!: string;
  phoneGasStation: string = "Carregando...";
  distGasStation!: number;
  addressGasStation!: string;
  urlLogo!: string;

  enableRouteButton: boolean = false;

  maxRadius: number = 0;

  constructor(
    private configurationProvider: ConfigurationProvider,
    private gasStationProvider: GasStationProvider,
    public sharedDataService: SharedDataService,
    public navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private renderer: Renderer2,
    private el: ElementRef,
    public modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
    let mapCenter = this.defaultLocation;

    try {


      const currentPosition = await this.getCurrentPosition();
      mapCenter = { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude };

      this.latitude = currentPosition.coords.latitude
      this.longitude = currentPosition.coords.longitude

      if (history.state.nav) {
        const state = history.state;
        this.goToServicesProductsCard(state.gasStation._id);
        let zoom: number;
        if (parseFloat(state.dist) <= 1000) {
          zoom = 17; // Zoom máximo se a distância for menor ou igual a 1 km
        } else if (parseFloat(state.dist) <= 5000) {
          zoom = 14;
        } else if (parseFloat(state.dist) <= 10000) {
          zoom = 12;
        } else {
          zoom = 10; // Zoom mínimo se a distância for maior que 10 km
        }

        let stationCoords = { lat: state.latitude, lng: state.longitude };

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(stationCoords);
        bounds.extend(mapCenter);
        const centro = bounds.getCenter();

        this.loadFilteredMap(mapCenter, zoom, state.gasStation._id, centro, state.dist, stationCoords);


      } else {
        this.loadMap(mapCenter);
      }

      this.configurationProvider.getDefaultProducts().subscribe(products => this.products = products);

    } catch (error) {
      console.error('Erro:', error);
    }

    // this.loadMapTeste(mapCenter);
  }

  // Função para formatar a distância em metros
  formatarDistancia(distancia: number): string {
    return (distancia / 1000).toFixed(3) + 'm';
  }

  formatarPreco(preco: number | undefined): string {
    if (preco != undefined) {

      return preco.toString().replace(".", ",");
    } else {
      return ""
    }
  }

  async loadFilteredMap(center: { lat: number, lng: number },
    zoomMap: number,
    gasStationId: string,
    centerMap: google.maps.LatLng,
    stationDist: any,
    stationCoords: { lat: number, lng: number }) {
    const mapElement = document.getElementById('map');
    if (mapElement) {

      // const newMap = await GoogleMap.create({
      //   id: 'my-map',
      //   element: mapElement as HTMLElement,
      //   apiKey: 'AIzaSyCP77hgD1OVKFj8RfeGjb_oKZNzm94lOo8', // Substitua com sua chave de API
      //   config: {
      //     center: stationDist < 100000 ? { lat: centerMap.lat(), lng: centerMap.lng() } : stationCoords,
      //     zoom: zoomMap,
      //   },
      // });

      // const markerCurrentLocation: Marker = {
      //   coordinate: {
      //     lat: center.lat,
      //     lng: center.lng
      //   },
      //   title: 'Você está aqui!',
      //   iconUrl: 'assets/imgs/logo_pesquisas.png',
      //   iconSize: { width: 22, height: 32 }
      // };

      // CÓDIGO NOVO QUE SETA O MAPA
      const directionsRenderer = new google.maps.DirectionsRenderer();
      const mapForPlotRoute = new google.maps.Map(mapElement, {
        center: stationCoords,
        zoom: 17
      });

      let markerPosition1 = new google.maps.LatLng(stationCoords.lat, stationCoords.lng);
      let marker1 = new google.maps.Marker({
        position: markerPosition1,
        map: mapForPlotRoute,
        title: 'Posto Selecionado',
        icon: {
          url: 'assets/imgs/default_pin.png',  // Caminho para a imagem do ícone
          scaledSize: new google.maps.Size(30, 35)  // Tamanho redimensionado do ícone (largura, altura)
        }
      });

      let markerPosition2 = new google.maps.LatLng(center.lat, center.lng);
      let marker2 = new google.maps.Marker({
        position: markerPosition2,
        map: mapForPlotRoute,
        title: 'Você está aqui!',
      });

      directionsRenderer.setMap(mapForPlotRoute);

      this.configurationProvider
        .getAddressByGeolocation(this.latitude, this.longitude)
        .subscribe(
          addressData => {
            this.currentLocation = addressData;
          },
          error => {
            console.error('Erro ao obter dados de endereço:', error);
          }
        );

      this.configurationProvider.getDefaultParameters().subscribe(data => {
        let radius = data.find(parameter => parameter.id == 2)!.value;

        this.maxRadius = parseFloat(radius);
      })

      this.gasStationProvider.getGasStationById(gasStationId, this.latitude, this.longitude)
        .subscribe(data => {
          if (this.gasStations == undefined) {
            this.gasStations = [];
            this.loadedGasStations = true;
          }

          this.setupStyle()

          let gasStationFiltered = data;

          const newMarker: Marker = {
            coordinate: { lat: gasStationFiltered.latitude, lng: gasStationFiltered.longitude },
            title: gasStationFiltered.name,
            iconUrl: 'assets/imgs/default_pin.png',
            iconSize: { width: 22, height: 32 }
          };

          // newMap.addMarker(newMarker);
        })

      this.gasStationProvider.getGasStationsByGeolocation(this.latitude, this.longitude)
        .subscribe(
          data => {
            this.gasStations = data;
          },
          error => {
            console.error('Erro ao obter dados de endereço:', error);
          }
        );

      // newMap.addMarker(markerCurrentLocation);

      // Adiciona marcadores aqui
      // this.addMarkers(newMap);

    } else {
      console.error('Elemento do mapa não encontrado');
    }
  }

  loadGoogleMaps(): Promise<any> {
    // Verifica se a API do Google Maps já está carregada
    if (window.google && window.google.maps) {
      return Promise.resolve(window.google);
    }

    // Carrega o script da API do Google Maps
    return new Promise<any>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiService.getApiKey()}&libraries=places`;
      script.onload = () => {
        resolve(window.google);
      };
      script.onerror = (error) => {
        reject('Failed to load Google Maps API');
      };
      document.body.appendChild(script);
    });
  }

  async loadMap(center: { lat: number, lng: number }) {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      
      // const newMap = await GoogleMap.create({
      //   id: 'my-map',
      //   element: mapElement as HTMLElement,
      //   apiKey: 'AIzaSyCP77hgD1OVKFj8RfeGjb_oKZNzm94lOo8', // Substitua com sua chave de API
      //   config: {
      //     center: center,
      //     zoom: 17,
      //   },
      // });

      await this.loadGoogleMaps();

      // CÓDIGO NOVO QUE SETA O MAPA
      const directionsRenderer = new google.maps.DirectionsRenderer();
      const mapForPlotRoute = new google.maps.Map(mapElement, {
        center: {
          lat: this.latitude,
          lng: this.longitude
        },
        zoom: 17
      });

      let markerPosition1 = new google.maps.LatLng(this.latitude, this.longitude);
      let marker1 = new google.maps.Marker({
        position: markerPosition1,
        map: mapForPlotRoute,
        title: 'Você está aqui!'
      });

      const markerCurrentLocation: Marker = {
        coordinate: {
          lat: center.lat,
          lng: center.lng
        },
        title: 'Você está aqui!',
        iconUrl: 'assets/imgs/logo_pesquisas.png',
        iconSize: { width: 22, height: 32 }
      };

      this.configurationProvider.getDefaultProducts().subscribe(products => this.products = products);

      await this.loadGoogleMaps();

      this.configurationProvider
        .getAddressByGeolocation(this.latitude, this.longitude)
        .subscribe(
          addressData => {
            this.currentLocation = addressData;
          },
          error => {
            console.error('Erro ao obter dados de endereço:', error);
          }
        );

      this.configurationProvider.getDefaultParameters().subscribe(data => {
        let radius = data.find(parameter => parameter.id == 2)!.value;

        this.maxRadius = parseFloat(radius);
      })

      this.gasStationProvider.getGasStationsByGeolocation(this.latitude, this.longitude)
        .subscribe(
          data => {
            if (this.gasStations == undefined) {
              this.gasStations = [];
              this.loadedGasStations = true;
            }

            this.gasStations = data;

            this.gasStations.forEach(gasstation => {

              console.log(gasstation.flagId)

              let pathLogoMarker = "default_pin.png";

              if(gasstation.flagId == 6 || gasstation.flagId == 7) pathLogoMarker = "ale-logo-marker.png";
              if(gasstation.flagId == 74 || gasstation.flagId == 109) pathLogoMarker = "shell-logo-marker.png";
              if(gasstation.flagId == 65) pathLogoMarker = "ipiranga-logo-marker.png";
              if(gasstation.flagId == 89) pathLogoMarker = "br-logo-marker.png";

              let markerPosition2 = new google.maps.LatLng(gasstation.latitude, gasstation.longitude);
              let marker2 = new google.maps.Marker({
                position: markerPosition2,
                map: mapForPlotRoute,
                title: gasstation.name,
                icon: {
                  url: 'assets/imgs/'+pathLogoMarker,  // Caminho para a imagem do ícone
                  scaledSize: new google.maps.Size(30, 35)  // Tamanho redimensionado do ícone (largura, altura)
                }
              });
            })

            this.setupStyle()

            data.forEach(elem => {

              const newMarker: Marker = {
                coordinate: { lat: elem.latitude, lng: elem.longitude },
                title: elem.name,
                iconUrl: 'assets/imgs/logo_app_color.png',
                iconSize: { width: 22, height: 32 }
              };

              this.stationsMarkers.push(newMarker)

            });

            if (this.stationsMarkers.length > 0) {
              this.stationsMarkers.forEach(marker => {

                // var infowindow = new google.maps.InfoWindow({
                //   content: marker.title
                // });

                // this.addMarkerListener(marker, infowindow);

                // newMap.addMarker(marker);
              })
            }
          },
          error => {
            console.error('Erro ao obter dados de endereço:', error);
          }
        );
  
        directionsRenderer.setMap(mapForPlotRoute);

      // newMap.addMarker(markerCurrentLocation);

      // Adiciona marcadores aqui
      // this.addMarkers(newMap);

    } else {
      console.error('Elemento do mapa não encontrado');
    }
  }

  // async loadMapTeste(center: { lat: number, lng: number }) {

  //   await this.loadGoogleMaps();

  //   const mapElement = document.getElementById('map');
  //   if (mapElement) { 

  //     const newMap = new google.maps.Map(mapElement, {
  //       center: center,
  //       mapId: 'my-map-teste',
  //       zoom: 17,
  //     });

  //     const newMarker = new google.maps.Marker({
  //       position: new google.maps.LatLng(this.latitude, this.longitude),
  //       map: newMap
  //     })

  //     var infowindow = new google.maps.InfoWindow({
  //       content: "Teste de evento \n teste e mais teste"
  //     });

  //     // Now we are inside the closure or scope of this for loop,
  //     // but we're calling a function that was defined in the global scope.
  //     this.addMarkerListener(newMarker, infowindow, newMap);
  //   }
  // }

  // loadGoogleMaps(): Promise<any> {
  //   return new Promise<any>((resolve, reject) => {
  //     const script = document.createElement('script');
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiService.getApiKey()}&libraries=places`;
  //     script.onload = resolve;
  //     script.onerror = reject;
  //     document.body.appendChild(script);
  //   });
  // }

  // private addMarkerListener(marker: google.maps.Marker, infowindow: google.maps.InfoWindow, map: google.maps.Map) {

  //   marker.addListener('click', function() {
  //     infowindow.open(map,marker);
  //   });

  //   marker.addListener('mouseout', function() {        
  //     infowindow.close();
  //   });

  // }

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

  async addMarkers(map: GoogleMap) {
    const markers: Marker[] = [
      { coordinate: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng }, title: "Ponto atual" },
      { coordinate: { lat: (this.defaultLocation.lat + 0.00085), lng: (this.defaultLocation.lng + 0.00025) }, title: "Ponto 1", iconUrl: 'assets/icon/logo_grey.png', iconSize: { width: 22, height: 32 } },
      { coordinate: { lat: (this.defaultLocation.lat - 0.00015), lng: (this.defaultLocation.lng - 0.00085) }, title: "Ponto 2", iconUrl: 'assets/icon/logo_grey.png', iconSize: { width: 22, height: 32 } },
    ];

    for (const marker of markers) {
      await map.addMarker(marker);
    }
  }

  plotRouteOnClick(lat: number, lng: number) {
    const mapElement = document.getElementById('map')!;
    const mapForPlotRoute = new google.maps.Map(mapElement, {
      center: {
        lat: this.latitude,
        lng: this.longitude
      },
      zoom: 17
    });

    this.configurationProvider.PlotRoute(mapForPlotRoute, this.latitude, this.longitude, lat, lng);
  }

  setupStyle() {
    if (this.gasStations.length > 0) {
      const curtainStations = this.el.nativeElement.querySelector(".curtain-stations");
      const curtainServProds = this.el.nativeElement.querySelector(".curtain-services-prods");
      if (curtainStations != null) this.renderer.setStyle(curtainStations, 'height', '345px');
      if (curtainServProds != null) this.renderer.setStyle(curtainServProds, 'height', '298px');
    }
  }

  toggleStations() {
    this.showStations = !this.showStations;

    const curtainStations = this.el.nativeElement.querySelector(".curtain-stations");
    const curtainServProds = this.el.nativeElement.querySelector(".curtain-services-prods");

    const btnRoute = this.el.nativeElement.querySelector(".btn-route");

    if (this.showStations) {
      this.arrowRotation = '180deg';


      if (curtainServProds != null) this.renderer.setStyle(curtainServProds, 'height', '298px');

      if (curtainStations != null) this.renderer.setStyle(curtainStations, 'height', '345px');

      this.renderer.setStyle(btnRoute, "position", "absolute");

    } else {
      this.arrowRotation = '0deg';
      if (curtainServProds != null) this.renderer.setStyle(curtainServProds, 'height', '0px');
      if (curtainStations != null) this.renderer.setStyle(curtainStations, 'height', '0px');

      this.renderer.setStyle(btnRoute, "position", "relative");
    }
  }

  produtoExiste(stationId: string) {

    let productVerification = false;

    const gasStation = this.gasStations.filter(x => x.id == stationId).map(x => x.products);

    gasStation.forEach(stations => {
      stations.forEach(elem => {
        if (elem.name == this.opcaoSelecionada) {
          productVerification = true;
        }
      })
    });

    return productVerification;

  }

  ShowStationProducts() {
    this.showStationProducts = true;
    this.showStationServices = false;

    this.toggleStyleButtons('#btn-products', '#btn-services');
  }

  ShowStationServices() {
    this.showStationProducts = false;
    this.showStationServices = true;

    this.toggleStyleButtons('#btn-services', '#btn-products');
  }

  toggleStyleButtons(btnActive: string, btnDisabled: string) {
    const btnAct = this.el.nativeElement.querySelector(btnActive);
    const btnDesab = this.el.nativeElement.querySelector(btnDisabled);

    this.renderer.setStyle(btnDesab, 'z-index', '0');
    this.renderer.setStyle(btnAct, 'z-index', '10');

    this.renderer.setStyle(btnDesab, 'background-color', '#274b83');
    this.renderer.setStyle(btnDesab, 'color', 'white');
    this.renderer.setStyle(btnDesab, 'font-weight', 'normal');

    this.renderer.setStyle(btnAct, 'background-color', 'white');
    this.renderer.setStyle(btnAct, 'color', '#274b83');
    this.renderer.setStyle(btnAct, 'font-weight', 'bold');
  }

  goToServicesProductsCard(idGastStations: string) {

    this.productsServicesCard = true;
    this.stationsCard = false;
    this.showStationProducts = true;
    this.showStationServices = false;
    this.gasStationProducts = undefined;
    this.stationServices = undefined;
    this.servicesLoadedGasStations = false;
    this.latGasStation = undefined;
    this.longGasStation = undefined;
    this.nameGasStation = "Carregando...";
    // this.refGasStation = "Carregando...";
    this.phoneGasStation == "Carregando...";

    this.gasStationProvider.getGasStationById(idGastStations, this.latitude, this.longitude)
      .subscribe(data => {

        this.gasStationProducts = data.products;
        this.latGasStation = data.latitude;
        this.longGasStation = data.longitude;
        this.nameGasStation = data.name;
        // this.refGasStation = data.reference;
        this.distGasStation = data.distance;
        this.addressGasStation = data.address;
        this.urlLogo = data.logo;

        this.verificationEnableRouteButton();

        const curtainServProds = this.el.nativeElement.querySelector(".curtain-services-prods");
        if (curtainServProds != null) this.renderer.setStyle(curtainServProds, 'height', '298px');

        this.gasStationServices = [];
        this.stationServices = [];

        this.phoneGasStation = data.phone;
        this.stationServices = data.services;
      });

    this.gasStationProvider.getGasStationsByGeolocation(this.latitude, this.longitude).subscribe(
      data => {

        let gasStn = data.find(x => x.id == idGastStations)!;
        this.refGasStation = gasStn.reference;
      },
      error => {
        console.error('Erro ao obter dados do posto de gasolina:', error);
      }
    );;

    // FORMA ALTERNATIVA DE PEGAR OS SERVIÇOS

    // this.configurationProvider.getDefaultServices().subscribe(
    //   dataServices => {
    //     this.gasStationServices = [];
    //     this.stationServices = [];
    //     dataServices.forEach(service => {
    //       this.gasStationProvider.getGasStationByLocationService(this.latitude, this.longitude, 31000, service.id)
    //         .subscribe(data => {
    //           let gasStationServ = data.find(x => x.id == idGastStations);
    //           this.phoneGasStation = gasStationServ!.phone;
    //           if (gasStationServ != undefined) {
    //             this.gasStationServices?.push(gasStationServ)
    //             this.stationServices?.push(gasStationServ.services[0]);
    //           }
    //         });
    //     })
    //   }
    // );

  }

  goToStationsCard() {
    this.stationsCard = true;
    this.productsServicesCard = false;

    this.loadMap({ lat: this.latitude, lng: this.longitude });

    setTimeout(() => {
      const curtainStations = this.el.nativeElement.querySelector(".curtain-stations");
      this.renderer.setStyle(curtainStations, 'height', '345px');
    }, 1000);

  }

  async upModal() {
    // const waitingModal = await this.modalCtrl.create({
    //   component: ListPriceGasStationPage
    // });

    // await waitingModal.present();
  }

  verificationEnableRouteButton() {

    this.configurationProvider.getDefaultParameters().subscribe(data => {
      let distMax = data.find(x => x.id == 12)!.value

      if (this.distGasStation < parseFloat(distMax)) {
        this.enableRouteButton = true;
      } else {
        this.enableRouteButton = false;
      }
    })

  }
}
