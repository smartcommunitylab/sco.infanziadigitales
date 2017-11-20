import { Time } from './../../../app/Classes/time';
import { StatusBar } from '@ionic-native/status-bar';
import { OrariModal } from './../Modals/orariModal/orariModal';
import { Service } from './../../../app/Classes/service';
import { School } from './../../../app/Classes/school';
import { WebService } from './../../../services/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { NavController, AlertController, ModalController, App } from 'ionic-angular';
import { APP_NAME } from '../../../services/config.service';
function compare(a, b) {
    if (a.fasce[0] && b.fasce[0] && a.fasce[0].start < b.fasce[0].start)
        return -1;
    if (a.fasce[0] && b.fasce[0] && a.fasce[0].start > b.fasce[0].start)
        return 1;
    return 0;
}
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

    filteredOrari: Service[];

    constructor(public navCtrl: NavController, private _app: App, private webService: WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) { }

    ngOnInit() {
        this.filteredOrari = this.orderFasce(this.selectedSchool.servizi);
    }

    showOrariModal(item: Service, isNew: boolean) {
        let modal = this.modalCtrl.create(OrariModal, {
             'orario': item,
              'school': this.selectedSchool,
               'isNew': isNew,
                'giaNorm': [item.normale] }, { enableBackdropDismiss: false, showBackdrop: false });
        modal.onDidDismiss((data) => {
            this._app.setTitle(APP_NAME);
        });
        modal.present();
    }

    newOrariModal() {
        this.showOrariModal(new Service('', [], [], false), true);
    }
    orderFasce(fasce) {
        var tmpFasce = fasce.sort(compare);
        return tmpFasce;
    }
    onDeleteOrario(item: Service) {
        let hasOrario = false;
        if (this.selectedSchool.kids) {
            hasOrario = this.selectedSchool.kids.some(k => k.services ? k.services.some(s => s.servizio.toLowerCase() == item.servizio.toLowerCase()) : false);
        }
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            message: hasOrario ? "Attenzione! L'orario è associato ad alcuni bambini." : null,
            cssClass: 'alertWarningCss',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.webService.update(this.selectedSchool).then(() => {
                            this.selectedSchool.servizi.splice(this.selectedSchool.servizi.findIndex(tmp => tmp.servizio.toLowerCase() === item.servizio.toLowerCase()), 1);
                            if (this.selectedSchool.kids) {
                                this.selectedSchool.kids.forEach(k => {
                                    if (k.services) k.services = k.services.filter(service => service.servizio.toLowerCase() != item.servizio.toLowerCase());
                                });
                            };
                        }, () => {
                            // TODO
                        })
                    }
                }
            ]
        })
        alert.present();
    }
}