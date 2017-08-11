import { Bus } from './../../../app/Classes/bus';
import { ActivatedRoute } from '@angular/router';
import { ParamMap } from '@angular/router';
import { Kid } from './../../../app/Classes/kid';
import { Group } from './../../../app/Classes/group';
import { WebService } from './../../../app/WebService';
import { School } from './../../../app/Classes/school';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { Parent } from "../../../app/Classes/parent";

@Component({
  selector: 'bambini',
  templateUrl: 'kid-component.html'
})

export class Bambini implements OnInit {
  @Input() selectedSchool: School; 
  thisSchool:School = new School();

  selectedKid : Kid;

  ordine: string = '0';
  filtro : string = '0';

  filteredKid : Kid[];

  kidClick : boolean[] = [false];

  edit : boolean;

  constructor(private webService : WebService, public alertCtrl: AlertController) {}

  ngOnInit(): void {
    Object.assign(this.thisSchool, this.selectedSchool)
    this.filteredKid = this.selectedSchool.kids;
    this.onFiltroKidChange(this.filtro);
  }

  handlerInputChange(e) {
    console.log(e.target.value)
  }

  onAddKid() {
    var k = new Kid('', '', '', '', new Date(''), '', false, new Parent('', '', '', '', '', ''), new Parent('', '', '', '', '', ''), new Bus('', '', []), [], [], [], false, []);
    this.onEditKid(k);
  }

  onViewKid(kid : Kid) {
    this.selectedKid = kid;
    this.edit = false;
    this.kidClick[0] = true;
    Object.assign(this.selectedSchool, this.thisSchool);
    this.webService.update(this.selectedSchool);
  }

  onEditKid(kid : Kid) {
    this.selectedKid = kid;
    this.edit = true;
    this.kidClick[0]= true;
    Object.assign(this.selectedSchool, this.thisSchool);
    this.webService.update(this.selectedSchool);
  }

  onDeleteKid(item : Kid) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.thisSchool.kids.splice(this.thisSchool.kids.findIndex(tmp => tmp.id === item.id), 1);
            Object.assign(this.selectedSchool, this.thisSchool);
            this.webService.update(this.selectedSchool);
          }
        }
      ]
    })
    alert.present();
  }

  onOrdineChange(ordine : string) {
    switch(ordine) {
      case '0':
        this.filteredKid.sort((item1, item2) => item1.name.localeCompare(item2.name));
      break;
      case '1':
        this.filteredKid.sort((item1, item2) => item2.name.localeCompare(item1.name));
      break;
      case '2':
        this.filteredKid.sort((item1, item2) => item1.surname.localeCompare(item2.surname));
      break;
      case '3':
        this.filteredKid.sort((item1, item2) => item2.surname.localeCompare(item1.surname));
      break;
    }
  }

  onFiltroKidChange(filtro : string) {
    switch(filtro) {
      case '0':
        this.filteredKid = this.selectedSchool.kids;
      break;
      case '1':
        this.filteredKid = this.selectedSchool.kids.filter(x=> x.gender === "Maschio");
      break;
      case '2':
        this.filteredKid = this.selectedSchool.kids.filter(x=> x.gender === "Femmina");;
      break;
      case '3':
        this.filteredKid = this.selectedSchool.kids.filter(x=> x.gender === "Altro");;
      break;
      case '4':
        this.filteredKid = this.selectedSchool.kids.filter(x=> x.section);
      break;
      case '5':
        this.filteredKid = this.selectedSchool.kids.filter(x=> !x.section);
      break;
    }
    this.onOrdineChange(this.ordine);
  }

  searchKids(item : any) {
    this.filteredKid = this.selectedSchool.kids;
    let val = item.target.value;
    if(val && val.trim() !== '') {
      this.filteredKid = this.filteredKid.filter(x => {
        var tmpN = x.name;
        var tmpS = x.surname;
        return (tmpN.toLowerCase().indexOf(val.toLowerCase()) >= 0 || tmpS.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }
}