import { WebService } from './../../../app/WebService';
import { GroupModal } from './../Modals/groupModal/groupModal';
import { School } from './../../../app/Classes/school';
import { Group } from './../../../app/Classes/group';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'gruppi',
  templateUrl: 'gruppi-component.html',
  styles: [`
      button[disabled] {
        opacity : 1
      }
      .list-md[no-lines] .item-block, .list-md[no-lines] ion-item-options, .list-md[no-lines] .item .item-inner {
        border-bottom: 1px solid #dedede !important;
        border-width: initial
      }
      .item-md .item-button {
        height: 40px;
        font-size: 14px;
      }
      .btnGroup {
        color: black;
        background-color: white;
        border: 1px black solid;
        border-radius: 0;
        -webkit-box-shadow: 0 0 0 0;
        box-shadow: 0 0 0 0;
        opacity : 1;
        text-transform: none;
      }
  `]
})

export class Gruppi implements OnInit {
  @Input() selectedSchool : School;
  thisSchool : School = new School();

  toDeleteGroup : Group = new Group('', [], false, []);

  ordine: string = '0';
  filtro : string = '0';
  filteredGroups : Group[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    Object.assign(this.thisSchool, this.selectedSchool);
    this.filteredGroups = this.selectedSchool.groups;
    this.onFiltroGroupChange(this.filtro);
  }

  showGroupModal(item: Group, isNew : boolean) {
    let modal = this.modalCtrl.create(GroupModal, {'group' : item, 'school' : this.thisSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.present().then(x=>{
      Object.assign(this.selectedSchool, this.thisSchool);
    });
  }

  newGroupModal() {
    var newGroup =  new Group('', [], false, []);
    this.showGroupModal(newGroup, true);
  }

  onDeleteGroup(item : Group) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.thisSchool.groups.splice(this.thisSchool.groups.findIndex(tmp => tmp.name.toLowerCase() === item.name.toLowerCase()), 1);
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
        this.filteredGroups.sort((item1, item2) => item1.name.localeCompare(item2.name));
      break;
      case '1':
        this.filteredGroups.sort((item1, item2) => item2.name.localeCompare(item1.name));
      break;
      case '2':
        this.filteredGroups.sort((item1, item2) => {
           if(item1.kids.length > item2.kids.length) return -1
          else if(item1.kids.length < item2.kids.length) return 1
          return 0
        })
      break;
      case '3':
        this.filteredGroups.sort((item1, item2) => {
          if(item1.kids.length > item2.kids.length) return 1
          else if(item1.kids.length < item2.kids.length) return -1
          return 0
        })
      break;
    }
  }

  onFiltroGroupChange(filtro : string) {
    switch(filtro) {
      case '0':
        this.filteredGroups = this.selectedSchool.groups;
      break;
      case '1':
        this.filteredGroups = this.selectedSchool.groups.filter(x => x.section === false)
      break;
      case '2':
        this.filteredGroups = this.selectedSchool.groups.filter(x => x.section === true)
      break;
    }
    this.onOrdineChange(this.ordine);
  }

  searchGroups(item : any) {
    this.filteredGroups = this.selectedSchool.groups;
    let val = item.target.value;
    if(val && val.trim() !== '') {
      this.filteredGroups = this.filteredGroups.filter(x => {
        var tmp = x.name;
        return (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }
}