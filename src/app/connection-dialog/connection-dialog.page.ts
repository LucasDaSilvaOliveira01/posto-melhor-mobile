import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-connection-dialog',
  templateUrl: './connection-dialog.page.html',
  styleUrls: ['./connection-dialog.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ConnectionDialogPage implements OnInit {
  modalData : any;
  constructor(public modalCtrl: ModalController) {}
    async openIonModal() {
      const modal = await this.modalCtrl.create({
        component: ConnectionDialogPage,
        componentProps: {
          'model_title': "Nomadic model's reveberation"
        }
      });
      modal.onDidDismiss().then((modalData) => {
        if (modalData !== null) {
          this.modalData = modalData.data;
        }
      });
      return await modal.present();
    }

  ngOnInit() {
  }
  async closeModel() {
    await this.modalCtrl.dismiss(close);
  }
  
  dismiss(){
    this.modalCtrl.dismiss();  
  }
}
