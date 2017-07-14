import { WebService } from './../../../app/WebService';
import { GroupModal } from './../Modals/groupModal/groupModal';
import { School } from './../../../app/Classes/school';
import { Group } from './../../../app/Classes/group';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'gruppi',
  templateUrl: 'gruppi-component.html'
})

export class Gruppi implements OnInit {
  @Input() selectedSchool: School; 
  toDeleteGroup : Group;
  ordine: string = '0';
  filtro : string = '0';
  filteredGroups : Group[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.filteredGroups = this.selectedSchool.groups;
  }

  showGroupModal(item: Group, isNew : boolean) {
    let modal = this.modalCtrl.create(GroupModal, {'group' : item, 'school' : this.selectedSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.present();
  }

  newGroupModal() {
    var newGroup =  new Group('', [], false, []);
    this.showGroupModal(newGroup, true);
  }

  deleteGroup(item : Group) {
    this.toDeleteGroup = new Group(item.name, item.kids, item.section, item.teachers)
    this.webService.remove(this.selectedSchool.id, this.toDeleteGroup).then(tmp=> {this.selectedSchool.groups = []; tmp.groups.forEach(x=>this.selectedSchool.groups.push(x)); this.filteredGroups = this.selectedSchool.groups});
  }

  onOrdineChange(ordine : string) {
    console.log(ordine);
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