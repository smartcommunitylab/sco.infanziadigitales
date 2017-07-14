import { Kid } from './../../../app/Classes/kid';
import { Group } from './../../../app/Classes/group';
import { WebService } from './../../../app/WebService';
import { School } from './../../../app/Classes/school';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'bambini',
  templateUrl: 'kid-component.html'
})

export class Bambini implements OnInit {
  @Input() selectedSchool: School; 
  toDeleteKid : Kid;
  ordine: string = '0';
  filtro : string = '0';
  filteredKid : Kid[];
  teacherGroups : Group[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.filteredKid = this.selectedSchool.kids;
  }

  deleteKid(item : Kid) {
    this.toDeleteKid = new Kid(item.id, item.name, item.surname);
    this.webService.remove(this.selectedSchool.id, this.toDeleteKid).then(tmp=> {this.selectedSchool.kids = []; tmp.kids.forEach(x=>this.selectedSchool.kids.push(x)); this.filteredKid = this.selectedSchool.kids});
  }

  onOrdineChange(ordine : string) {
    console.log(ordine);
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
    }
  }

  searchKids(item : any) {
    this.filteredKid = this.selectedSchool.kids;
    let val = item.target.value;
    if(val && val.trim() !== '') {
      this.filteredKid = this.filteredKid.filter(x => {
        var tmp = x.name;
        return (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }
}