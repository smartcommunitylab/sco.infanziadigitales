import { StatusBar } from '@ionic-native/status-bar';
import { OrariModal } from './../Modals/orariModal/orariModal';
import { Service } from './../../../app/Classes/service';
import { School } from './../../../app/Classes/school';
import { WebService } from './../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'orari',
  templateUrl: 'orari-component.html',
    styles: [`
      button[disabled] {
        opacity : 1
      }
      .item-md .item-button {
        height: 40px;
        font-size: 14px;
      }
    `]
})


export class Orari implements OnInit {
    @Input() selectedSchool: School;
    thisSchool : School = new School();

    ordine: string = '2';

    filteredOrari : Service[];

    constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

    ngOnInit() {
        Object.assign(this.thisSchool, this.selectedSchool);
        this.filteredOrari = this.thisSchool.servizi;
        this.onOrdineChange(this.ordine);
    }

    onOrdineChange(ordine : string) {
        console.log(ordine)
        switch(ordine) {
            case '0':
                this.filteredOrari.sort((item1, item2) => item1.servizio.localeCompare(item2.servizio));
            break;
            case '1':
                this.filteredOrari.sort((item1, item2) => item2.servizio.localeCompare(item1.servizio));
            break;
            case '2':
                this.filteredOrari.sort((item1, item2) => item1.fasce[0].start.localeCompare(item2.fasce[0].start));
            break;
            case '3':
                this.filteredOrari.sort((item1, item2) => item2.fasce[0].start.localeCompare(item1.fasce[0].start));
            break;
        }
    }

    showOrariModal(item: Service, isNew : boolean) {
        let modal = this.modalCtrl.create(OrariModal, {'orario' : item, 'school' : this.thisSchool, 'isNew' : isNew, 'giaNorm' : [this.thisSchool.servizi.findIndex(x=>x.normale === true) >= 0]}, {enableBackdropDismiss: false, showBackdrop: false});
        modal.present().then(x=>{
            Object.assign(this.selectedSchool, this.thisSchool);
            this.onOrdineChange(this.ordine);
        });
    }

    newOrariModal() {
        this.showOrariModal(new Service('', [], [], false), true);
        this.webService.update(this.selectedSchool);
        this.onOrdineChange(this.ordine);
    }

    onDeleteOrario(item : Service) {
        this.thisSchool.servizi.splice(this.thisSchool.servizi.findIndex(tmp => tmp.servizio.toLowerCase() === item.servizio.toLowerCase()), 1);
        Object.assign(this.selectedSchool, this.thisSchool);
        this.webService.update(this.selectedSchool);
        this.onOrdineChange(this.ordine);
    }

    searchOrario(item : any) {
        this.filteredOrari = this.selectedSchool.servizi;
        let val = item.target.value;
        if(val && val.trim() !== '') {
            this.filteredOrari = this.filteredOrari.filter(x => {
                var tmp = x.servizio;
                return (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);
            })
        }
    }
}