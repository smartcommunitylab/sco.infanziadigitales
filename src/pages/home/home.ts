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

  toDeleteGroup : Group;
  toDeleteBus : Bus;

  ordine: string = '0';
  filtro : string = '0';

  filteredGroups : Group[];
  filteredBus : Bus[];



  constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.webService.getData().then(item => { this.schools = item });
  }

  onSchoolChange(selectedId : string) {
    this.webService.getSchool(selectedId).then(item => { 
      this.selectedSchool = item; 
      this.filteredGroups = this.selectedSchool.groups; 
      this.onOrdineChange(this.ordine, this.filteredGroups); 
      this.filteredBus = this.selectedSchool.buses;
      this.onOrdineChange(this.ordine, this.filteredBus)});
  }

  onSegmentChange() {
    this.filteredGroups = this.selectedSchool.groups;
    this.ordine = '0'
    this.filtro = '0'
    this.filteredBus = this.selectedSchool.buses;
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
    this.webService.remove(this.selectedId, this.toDeleteGroup).then(tmp=> {this.selectedSchool.groups = []; tmp.groups.forEach(x=>this.selectedSchool.groups.push(x)); this.filteredGroups = this.selectedSchool.groups});
  }

  onOrdineChange(ordine : string, array : any[]) {
    console.log(ordine);
    switch(ordine) {
      case '0':
        array.sort((item1, item2) => item1.name.localeCompare(item2.name));
      break;
      case '1':
        array.sort((item1, item2) => item2.name.localeCompare(item1.name));
      break;
      case '2':
        array.sort((item1, item2) => {
          if(item1.kids.length > item2.kids.length) return -1
          else if(item1.kids.length < item2.kids.length) return 1
          return 0
        })
      break;
      case '3':
        array.sort((item1, item2) => {
          if(item1.kids.length > item2.kids.length) return 1
          else if(item1.kids.length < item2.kids.length) return -1
          return 0
        })
      break;
      case '4':
        array.sort((item1, item2) => item1.capolinea.localeCompare(item2.name));
      break;
      case '5':
        array.sort((item1, item2) => item2.capolinea.localeCompare(item1.name));
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

  showBusModal(item: Bus, isNew : boolean) {
    let modal = this.modalCtrl.create(BusModal, {'bus' : item, 'school' : this.selectedSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
      modal.present();
  }

  newBusModal() {
    var newBus = new Bus('', '', []);
    this.showBusModal(newBus, true);
  }

  deleteBus(item : Bus) {
    this.toDeleteBus = new Bus(item.name, item.capolinea, item.kids);
    this.webService.remove(this.selectedId, this.toDeleteBus).then(tmp => {this.selectedSchool.buses = []; tmp.buses.forEach(x => this.selectedSchool.buses.push(x)); this.filteredBus = this.selectedSchool.buses});
  }

  searchBus(item : any) {
    this.filteredBus = this.selectedSchool.buses;
    let val = item.target.value;
    if(val && val.trim() !== '') {
      this.filteredBus = this.filteredBus.filter(x => {
        var tmp = x.name;
        return (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }

}
