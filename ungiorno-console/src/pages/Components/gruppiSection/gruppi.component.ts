import { WebService } from './../../../services/WebService';
import { GroupModal } from './../Modals/groupModal/groupModal';
import { School } from './../../../app/Classes/school';
import { Group } from './../../../app/Classes/group';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController, App } from 'ionic-angular';
import { APP_NAME } from '../../../services/config.service';

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

  toDeleteGroup : Group = new Group('', [], false, []);

  ordine: string = '0';
  filtro : string = '0';
  filteredGroups : Group[];
  searchText: string = '';

  constructor(private webService : WebService, private _app: App, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.onFiltroGroupChange(this.filtro);
  }

  showGroupModal(item: Group, isNew : boolean) {
    let modal = this.modalCtrl.create(GroupModal, {'group' : item, 'school' : this.selectedSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.onDidDismiss(data => {
      this.onFiltroGroupChange(this.filtro);
      this._app.setTitle(APP_NAME);
    });
    modal.present();
  }

  newGroupModal() {
    var newGroup =  new Group('', [], false, []);
    this.showGroupModal(newGroup, true);
  }
  newSectionModal() {
    var newGroup =  new Group('', [], true, []);
    this.showGroupModal(newGroup, true);
  }

  onDeleteGroup(item : Group) {
    let hasKids = !!item.kids && item.kids.length > 0;
    let hasTeachers = !!item.teachers && item.teachers.length > 0;

    let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            message: (hasKids || hasTeachers) ? 'Attenzione! I bambini di questo gruppo dovranno essere associati ad un’altro gruppo' : null,
            cssClass:'alertWarningCss',
            buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            let tmpSchool = School.copy(this.selectedSchool);
            tmpSchool.groups.splice(this.selectedSchool.groups.findIndex(tmp => tmp.name.toLowerCase() === item.name.toLowerCase()), 1);
            this.webService.update(tmpSchool).then(() => {
              // update kids attached
              if (item.section) {
                this.selectedSchool.kids.forEach(kid => {
                  if (kid.section == item.name) kid.section = null;
                });  
              }
              this.selectedSchool.groups = tmpSchool.groups;
              this.onFiltroGroupChange(this.filtro);              
            }, err => {
              // TODO handle error
            });
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

  readonly filterArray = {
    '0': x => true,
    '1': x => x.section === false,
    '2': x => x.section === true
  };

  private getFilterFunction() {
    if (this.searchText && this.searchText.trim() !== '') {
      let val = this.searchText.trim();
      return x => {
        let tmp = x.name;
        let result = true;
        if (this.filterArray[this.filtro]) result = this.filterArray[this.filtro](x);
        return result && (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);        
      }
    } else if (this.filterArray[this.filtro]) {
      return this.filterArray[this.filtro];
    } else {
      return x => true;
    }
  }

  onFiltroGroupChange(filtro: string) {
    this.filteredGroups = this.selectedSchool.groups.filter(this.getFilterFunction());
    this.onOrdineChange(this.ordine);
  }

  searchGroups(item: any) {
    this.filteredGroups = this.selectedSchool.groups;
    let val = item.target.value;
    if (val && val.trim() !== '') {
      this.filteredGroups = this.filteredGroups.filter(this.getFilterFunction());
    }
  }
}