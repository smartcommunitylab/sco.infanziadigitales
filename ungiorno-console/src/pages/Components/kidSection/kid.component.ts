import { BusService } from './../../../app/Classes/busService';
import { ActivatedRoute } from '@angular/router';
import { ParamMap } from '@angular/router';
import { Kid } from './../../../app/Classes/kid';
import { Group } from './../../../app/Classes/group';
import { WebService } from './../../../services/WebService';
import { School } from './../../../app/Classes/school';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { Parent } from "../../../app/Classes/parent";
import { ConfigService } from "./../../../services/config.service"


@Component({
  selector: 'bambini',
  templateUrl: 'kid-component.html'
})

export class Bambini implements OnInit {
  @Input() selectedSchool: School;

  selectedKid: Kid;

  ordine: string = '0';
  filtro: string = '0';

  filteredKid: Kid[];
  searchField = "";



  schoolSections: Group[];
  edit: boolean;
  private apiUrl;
  constructor(private webService: WebService, public alertCtrl: AlertController, private configService: ConfigService) {
    this.apiUrl = this.configService.getConfig('apiUrl');
  }

  ngOnInit(): void {
    this.filteredKid = this.selectedSchool.kids;
    this.onFiltroKidChange(this.filtro);
    this.schoolSections = this.selectedSchool.groups.filter(group => group.section)
    for (let i=0;i<this.schoolSections.length;i++){
      this.filterArray[this.schoolSections[i].name]= x => x.section ===this.schoolSections[i].name;
    }
    
  }

  handlerInputChange(e) {
    console.log(e.target.value)
  }

  onAddKid() {
    var k = new Kid('', '', '', '', null, '', '', new Parent('', '', ''), new Parent('', '', ''), new BusService(), [], [], [], false, []);
    this.onEditKid(k);
  }

  onViewKid(kid: Kid) {
    this.selectedKid = kid;
    this.edit = false;
  }

  onEditKid(kid: Kid) {
    this.selectedKid = kid;
    this.edit = true;
  }

  onKidUpdated(kid: Kid) {
    this.selectedKid = null;
    this.onFiltroKidChange(this.filtro);    
  }

  onDeleteKid(item: Kid) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.webService.remove(this.selectedSchool, item).then(() => {
              this.selectedSchool.kids.splice(this.selectedSchool.kids.findIndex(tmp => tmp.id === item.id), 1);
              this.filteredKid.splice(this.filteredKid.findIndex(tmp => tmp.id === item.id), 1);
              if (this.selectedSchool.groups) {
                    this.selectedSchool.groups.forEach(g => {
                      if (g.kids) g.kids = g.kids.filter(kid => kid.toLowerCase() != item.id.toLowerCase());
                    });
                  }
            }, err => {
              // TODO handle error
            });
          }
        }
      ]
    })
    alert.present();
  }

  onOrdineChange(ordine: string) {
    switch (ordine) {
      case '2':
        this.filteredKid.sort((item1, item2) => item1.name.localeCompare(item2.name));
        break;
      case '3':
        this.filteredKid.sort((item1, item2) => item2.name.localeCompare(item1.name));
        break;
      case '0':
        this.filteredKid.sort((item1, item2) => item1.surname.localeCompare(item2.surname) != 0 ? item1.surname.localeCompare(item2.surname) : item1.name.localeCompare(item2.name));
        break;
      case '1':
        this.filteredKid.sort((item1, item2) => item2.surname.localeCompare(item1.surname) != 0 ? item2.surname.localeCompare(item1.surname) : item2.name.localeCompare(item1.name));
        break;
    }
  }

  filterArray = {
    '0': x => true,
    '1': x => x.gender === "Maschio",
    '2': x => x.gender === "Femmina",
    '3': x => x.gender === "Altro",
    '4': x => x.section,
    '5': x => !x.section
  };

  private getFilterFunction() {
    if (this.searchField && this.searchField.trim() !== '') {
      let val = this.searchField.trim();
      return x => {
        let tmpN = x.name;
        let tmpS = x.surname;
        let result = true;
        if (this.filterArray[this.filtro]) result = this.filterArray[this.filtro](x);
        return result && (tmpN.toLowerCase().indexOf(val.toLowerCase()) >= 0 || tmpS.toLowerCase().indexOf(val.toLowerCase()) >= 0);        
      }
    } else if (this.filterArray[this.filtro]) {
      return this.filterArray[this.filtro];
    } else {
      return x => true;
    }
  }

  onFiltroKidChange(filtro: string) {
    this.filteredKid = this.selectedSchool.kids.filter(this.getFilterFunction());

    this.onOrdineChange(this.ordine);
  }
  getImage(child) {
    let image = this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + child.id + "/" + sessionStorage.getItem('access_token');
    return image;
  }

  searchKids(item: any) {
    this.filteredKid = this.selectedSchool.kids;
    let val = item.target.value;
    // if (val && val.trim() !== '') {
      this.filteredKid = this.filteredKid.filter(this.getFilterFunction());
    // }
  }
}