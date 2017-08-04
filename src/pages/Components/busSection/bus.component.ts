import { BusModal } from './../Modals/busModal/busModal';
import { Bus } from './../../../app/Classes/bus';
import { School } from './../../../app/Classes/school';
import { WebService } from './../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'buses',
  templateUrl: 'bus-component.html',
  styles: [`
      .item-md .item-button {
        height: 40px;
        font-size: 14px;
      }
      .btnBus {
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


export class Buses implements OnInit {
    @Input() selectedSchool: School;
    thisSchool : School = new School();

    ordine: string = '0';
    filteredBus : Bus[];

    constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

    ngOnInit(): void {
      Object.assign(this.thisSchool, this.selectedSchool);
      this.filteredBus = this.thisSchool.buses;
      this.onOrdineChange(this.ordine);
    }

    onOrdineChange(ordine : string) {
    console.log(ordine);
    switch(ordine) {
      case '0':
        this.filteredBus.sort((item1, item2) => item1.name.localeCompare(item2.name));
      break;
      case '1':
        this.filteredBus.sort((item1, item2) => item2.name.localeCompare(item1.name));
      break;
      case '2':
        this.filteredBus.sort((item1, item2) => item1.capolinea.localeCompare(item2.capolinea));
      break;
      case '3':
        this.filteredBus.sort((item1, item2) => item2.capolinea.localeCompare(item1.capolinea));
      break;
      case '4':
        this.filteredBus.sort((item1, item2) => {
          if(item1.kids.length > item2.kids.length) return -1
          else if(item1.kids.length < item2.kids.length) return 1
          return 0
        })
      break;
      case '5':
        this.filteredBus.sort((item1, item2) => {
          if(item1.kids.length > item2.kids.length) return 1
          else if(item1.kids.length < item2.kids.length) return -1
          return 0;
        })
      break;
    }
  }

  showBusModal(item: Bus, isNew : boolean) {
    let modal = this.modalCtrl.create(BusModal, {'bus' : item, 'school' : this.thisSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.present().then(x=>{
      Object.assign(this.selectedSchool, this.thisSchool);
    });
  }

  newBusModal() {
    var newBus = new Bus('', '', []);
    this.showBusModal(newBus, true);
  }

  onDeleteBus(item : Bus) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.thisSchool.buses.splice(this.thisSchool.buses.findIndex(tmp => tmp.name.toLowerCase() === item.name.toLowerCase()), 1);
            Object.assign(this.selectedSchool, this.thisSchool);
            this.webService.update(this.selectedSchool);
          }
        }
      ]
    })
    alert.present();
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