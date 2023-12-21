import { Component, OnInit } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  private static readonly DEFAULT_LATITUDE = -23.4486138;
  private static readonly DEFAULT_LONGITUDE = -51.9472739;
  defaultLocation = { lat: MapPage.DEFAULT_LATITUDE, lng: MapPage.DEFAULT_LONGITUDE };

  constructor() {}

  async ngOnInit() {
    let mapCenter = this.defaultLocation;

    try {
      const currentPosition = await this.getCurrentPosition();
      mapCenter = { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude };
    } catch (error) {
      console.error('Erro:', error);
      console.log('teste');
    }

    this.loadMap(mapCenter);
  }

  async loadMap(center: { lat: number, lng: number }) {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const newMap = await GoogleMap.create({
        id: 'my-map',
        element: mapElement as HTMLElement,
        apiKey: 'AIzaSyDNbSnMzTb0HF5dVy_8r-dNSg8yAaxO7TY', // Substitua com sua chave de API
        config: {
          center: center,
          zoom: 17,
        },
      });

      // Adiciona marcadores aqui
      this.addMarkers(newMap);
    } else {
      console.error('Elemento do mapa não encontrado');
    }
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalização não suportada pelo navegador.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }

  async addMarkers(map: GoogleMap) {
    const markers: Marker[] = [
      { coordinate: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng }, title: "Ponto atual" },
      { coordinate: { lat: (this.defaultLocation.lat + 0.00025), lng: (this.defaultLocation.lng + 0.00025) }, title: "Ponto 1", iconUrl: 'assets/icon/logo_grey.png', iconSize: { width: 22, height: 32 }  },
      { coordinate: { lat: (this.defaultLocation.lat - 0.00015), lng: (this.defaultLocation.lng - 0.00015) }, title: "Ponto 2", iconUrl: 'assets/icon/logo_grey.png', iconSize: { width: 22, height: 32 } },
    ];

    for (const marker of markers) {
      await map.addMarker(marker);
    }
  }

}
