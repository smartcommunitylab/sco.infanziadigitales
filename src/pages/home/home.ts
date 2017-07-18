import { BusModal } from './../Components/Modals/busModal/busModal';
import { Bus } from './../../app/Classes/bus';
import { Group } from './../../app/Classes/group';
import { GroupModal } from './../Components/Modals/groupModal/groupModal';
import { WebService } from './../../app/WebService';
import { School } from './../../app/Classes/school';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styles: [`
    ion-card-header {
      background-color: rgba(152,186,60, .8);
    }
  `]
})
export class HomePage implements OnInit {
  schools: School[];

  settings:string = "profilo";

  selectedSchool : School;
  selectedId : string;

  constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.webService.getData().then(item => { this.schools = item });
  }

  onSchoolChange(selectedId : string) {
    this.webService.getSchool(selectedId).then(item => this.selectedSchool = item);
  }

  onSegmentChange() {
    this.webService.getSchool(this.selectedId).then(x => this.selectedSchool = x)
  }

  showPromptOnContattiEdit() {
    let prompt = this.alertCtrl.create({
      title: 'Contatti',
      message: "Modifica contatti",
      inputs: [
        {
          type: 'tel',
          name: 'tel',
          placeholder: 'Telefono',
          value: this.selectedSchool.telephone
        },
        {
          type: 'email',
          name: 'email',
          placeholder: 'Email',
          value: this.selectedSchool.email
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.selectedSchool.telephone = data.tel;
            this.selectedSchool.email = data.email;
            this.webService.update(this.selectedSchool);
          }
        }
      ]
    });
    prompt.present();
  }

}
