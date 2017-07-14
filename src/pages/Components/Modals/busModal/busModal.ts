import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Bus } from './../../../../app/Classes/bus';
import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

@Component({
  selector: 'bus-modal',
  templateUrl: 'busModal.html',
})

export class BusModal {
  selectedBus: Bus;
  newBus : Bus;
  school : School;
  isNew : boolean = false;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
    this.school = this.params.get('school') as School;
    this.selectedBus = this.params.get('bus') as Bus;
    this.isNew = this.params.get('isNew') as boolean;

    this.newBus = new Bus('', '', []);
    this.newBus.name = this.selectedBus.name;
    this.selectedBus.kids.forEach(x => this.newBus.kids.push(x) )
    this.newBus.capolinea = this.selectedBus.capolinea;
  }

  close() {
    this.navCtrl.pop();
  }

  save() {
    this.selectedBus.name = this.newBus.name;
    this.selectedBus.kids = new Array();
    this.newBus.kids.forEach(x => this.selectedBus.kids.push(x) )
    this.selectedBus.capolinea = this.newBus.capolinea;

    if(this.isNew) {
      console.log(this.selectedBus);
      if(this.school.buses.findIndex(x => x.name.toLowerCase() == this.selectedBus.name.toLowerCase()) < 0)
        this.webService.add(this.school.id, this.newBus).then(tmp => this.school.buses.push(tmp.buses[tmp.buses.length - 1]));
    }
    this.navCtrl.pop();
  }


  addKid() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    
    this.school.kids.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: JSON.stringify(element),
        checked: this.newBus.kids.findIndex(x => x.id === element.id) >= 0
      })
    });

    alert.addButton('Annulla');
    alert.addButton({
      text: 'OK',
      handler: data => {
        var x = new Array();
        data.forEach(element => {
          x.push(JSON.parse(element) as Kid)
        });
        this.newBus.kids = x
      }
    })
    alert.present();
  }

  removeKid(kid : Kid) {
    this.newBus.kids.splice(this.newBus.kids.findIndex(x => kid.id == x.id), 1);
  }
}