import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Bus } from './../../../../app/Classes/bus';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

@Component({
  selector: 'bus-modal',
  templateUrl: 'busModal.html',
  styles: [
    `
      ion-card-header {
            font-size: 20px !important;
            background-color: rgba(152,186,60, .4);
        }
    `
  ]
})

export class BusModal implements OnInit {
  selectedSchool : School;

  selectedBus: Bus;
  copiedBus : Bus = new Bus('', '');

  selectedBusKids : Kid[] = [];

  isNew : boolean;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
    this.selectedSchool = this.params.get('school') as School;
    this.selectedBus = this.params.get('bus') as Bus;
    this.isNew = this.params.get('isNew') as boolean;

    Object.assign(this.copiedBus, this.selectedBus);
    this.copiedBus.kids = new Array();
    this.selectedBus.kids.forEach(x => this.copiedBus.kids.push(x));
  }

  ngOnInit() {
    this.updateArray();
  }

  updateArray() {
    this.selectedBusKids = [];

    this.copiedBus.kids.forEach(item => {
      this.selectedBusKids.push(this.selectedSchool.kids.find(x => x.id.toLowerCase() === item.toLowerCase()))
    })

    this.webService.update(this.selectedSchool);
  }

  close() {
    this.webService.update(this.selectedSchool);
    this.navCtrl.pop();
  }

  save() {
    Object.assign(this.selectedBus, this.copiedBus);
    this.selectedBus.kids = new Array();
    this.copiedBus.kids.forEach(x => this.selectedBus.kids.push(x) )

    if(this.isNew) {
      if(this.selectedSchool.buses.findIndex(x => x.name.toLowerCase() == this.selectedBus.name.toLowerCase()) < 0) {
        this.webService.add(this.selectedSchool.id, this.copiedBus).then(tmp => this.selectedSchool.buses.push(tmp.buses[tmp.buses.length - 1]));
      }
      else {
        let alert = this.alertCtrl.create({
          subTitle: 'Elemento già presente (conflitto di nomi)',
          buttons: ['OK']
        });
        alert.present();
      }
    }
    this.close();
  }


  addKid() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    
    this.selectedSchool.kids.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: element.id,
        checked: this.copiedBus.kids.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0
      })
    });
    this.copiedBus.kids = [];
    alert.addButton('Annulla');
    alert.addButton({
      text: 'OK',
      handler: data => {
        data.forEach(element => {
          this.copiedBus.kids.push(element);
          this.updateArray();
        });
      }
    })
    alert.present();
  }

  removeKid(kid : Kid) {
    this.copiedBus.kids.splice(this.copiedBus.kids.findIndex(x => kid.id.toLowerCase() == x.toLowerCase()), 1);
    this.updateArray();
  }
}