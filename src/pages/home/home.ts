import { WebService } from './../../app/WebService';
import { School } from './../../app/Classes/school';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

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

  constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController) {}

  ngOnInit(): void {
    this.webService.getData().then(item => { this.schools = item });
  }

  onSchoolChange(selectedId : string) {
    this.webService.getSchool(selectedId).then(item => { this.selectedSchool = item });
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
          }
        }
      ]
    });
    prompt.present();
  }
}
