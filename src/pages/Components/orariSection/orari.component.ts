import { Service } from './../../../app/Classes/service';
import { School } from './../../../app/Classes/school';
import { WebService } from './../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'orari',
  templateUrl: 'orari-component.html',
})


export class Orari implements OnInit {
    @Input() selectedSchool: School;
    thisSchool : School = new School();

    ordine: string = '0';
    filtro : string = '0';

    filteredOrari : Service[];

    constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

    ngOnInit() {
        Object.assign(this.thisSchool, this.selectedSchool);
        this.filteredOrari = this.thisSchool.servizi;
        this.onOrdineChange(this.ordine);
    }

    onOrdineChange(ordine : string) {
        
    }

    showOrariModal() {

    }

    newOrariModal() {

    }

    onDeleteOrario() {

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