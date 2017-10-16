import { Time } from './../../../app/Classes/time';
import { StatusBar } from '@ionic-native/status-bar';
import { OrariModal } from './../Modals/orariModal/orariModal';
import { Service } from './../../../app/Classes/service';
import { School } from './../../../app/Classes/school';
import { WebService } from './../../../services/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'orari',
  templateUrl: 'orari-component.html',
    styles: [`
        .item-md .item-button {
            height: 40px;
            font-size: 14px;
        }
        .btnFasce {
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


export class Orari implements OnInit {
    @Input() selectedSchool: School;

    filteredOrari : Service[];

    constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

    ngOnInit() {
        this.filteredOrari = this.selectedSchool.servizi;
    }

    showOrariModal(item: Service, isNew : boolean) {
        let modal = this.modalCtrl.create(OrariModal, {'orario' : item, 'school' : this.selectedSchool, 'isNew' : isNew, 'giaNorm' : [item.normale]});
        modal.present();
    }

    newOrariModal() {
        this.showOrariModal(new Service('', [], [], false), true);
    }

    onDeleteOrario(item : Service) {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                text: 'OK',
                handler: () => {
                    this.selectedSchool.servizi.splice(this.selectedSchool.servizi.findIndex(tmp => tmp.servizio.toLowerCase() === item.servizio.toLowerCase()), 1);
                    this.webService.update(this.selectedSchool);
                },
                }
            ]
        })
        alert.present();
    }
}