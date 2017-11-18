import { WebService } from './../../../services/WebService';
import { AlertController, ToastController } from 'ionic-angular';
import { School } from './../../../app/Classes/school';
import { Bus } from './../../../app/Classes/bus';
import { Component, OnInit, Input } from '@angular/core';

import { CommonService } from  './../../../services/common.service';

@Component({
    selector: 'info',
    templateUrl: 'info-component.html',
    styles: [`
    ion-grid {
        font-size: 17px !important;
    }
    ion-card-header {
        font-size: 20px !important;
        background-color: rgba(152,186,60, .4);
    }
    .text-input {
        border: solid 1px black;
        border-radius: 7px 7px 7px 7px;
        padding-left: 8px;
        margin-left: 0;
    }
    .text-input[disabled] {
        opacity:  1;
        border: none;
    }
    .select {
        padding: 0 8px 0 8px;
    }
    ion-select {
        overflow: initial;
        border: solid 1px black;
        border-radius: 7px 7px 7px 7px;
    }
    ion-select[disabled] {
        opacity:  1;
        border: none;
    }
    .datetime {
        padding: 0 0 0 8px;
        border: solid 1px black;
        border-radius: 7px;
        margin-right: 18px;
    }
    #giord {
        border: solid 1px black;
        border-radius: 7px 7px 7px 7px;
        padding: 4px 0 4px 8px;
        margin: 0;
        width: 95%;
    }
  `]
})


export class Info implements OnInit {
    @Input() selectedSchool: School;

    // data for contacts section
    newContatti: any = {};
    editContatti: boolean = false;
    // data for assenze section
    newAssenza: string;
    editAssenze: boolean = false;
    newAssenze: string[];
    // data for malattie section
    newMalattia: string;
    editMalattie: boolean = false;
    newMalattie: string[];
    isMalattiaEnabled: boolean;
    // data for bus section
    editBus: boolean = false;
    newBus: string;
    newBuses: Bus[];

    constructor(private alertCtrl: AlertController, private webService: WebService, private toastCtrl: ToastController) { }

    ngOnInit(): void {
    }

    isInEdit(): boolean {
        return this.editContatti || this.editAssenze || this.editMalattie || this.editBus;
    }


    onContattiEdit() {
        this.editContatti = true;
        this.newContatti.email = this.selectedSchool.email;
        this.newContatti.phone = this.selectedSchool.phoneNumbers.length > 0 ? this.selectedSchool.phoneNumbers[0] : '';        
    }

    onContattiSave() {
        if (!this.newContatti.email || CommonService.emailValidator(this.newContatti.email, this.toastCtrl)) {
            if (!this.newContatti.phone || CommonService.phoneValidator(this.newContatti.phone, this.toastCtrl)) {
                this.editContatti = false;
                let schoolCopy = School.copy(this.selectedSchool);
                schoolCopy.email = this.newContatti.email;
                schoolCopy.phoneNumbers = [this.newContatti.phone];
                this.webService.update(schoolCopy).then(() => {
                    this.selectedSchool.copyInto(schoolCopy);
                }, err => {
                    // TODO handle error
                    this.editContatti = true;                    
                });
            }
        }
    }

    onContattiCancel() {
        this.editContatti = false;
    }

    onAssenzeEdit() {
        this.newAssenze = [];
        this.newAssenza = '';
        if (this.selectedSchool.assenze) {
            this.selectedSchool.assenze.forEach(x => this.newAssenze.push(x));
        }    
        this.isMalattiaEnabled = this.selectedSchool.malattia;
        this.editAssenze = true;
    }

    onAssenzeSave() {
        let handler = () => {
            this.editAssenze = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.malattia = this.isMalattiaEnabled;
            schoolCopy.assenze = this.newAssenze;
    
            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
            }, err => {
                // TODO handle error
                this.editAssenze = true;                    
            });    
        }
        this.checkNonSavedValue(this.newAssenza, handler);
    }

    onAssenzeCancel() {
        this.editAssenze = false;
    }

    addAssenza(assenza: string) {
        if (assenza !== undefined && assenza !== '') {
            if (this.newAssenze.findIndex(x => x.toLowerCase() === assenza.toLowerCase()) < 0) {
                this.newAssenze.push(assenza);
                this.newAssenza = '';
            } else {
                let alert = this.alertCtrl.create();
                alert.setSubTitle('Voce già presente');
                alert.addButton('OK');
                alert.present();
            }
        }    
    }

    removeAssenza(assenza: string) {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.newAssenze.splice(this.newAssenze.findIndex(x => x.toLowerCase() === assenza.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }

    onMalattieEdit() {
        this.newMalattie = [];
        this.newMalattia = '';
        if (this.selectedSchool.malattie) {
            this.selectedSchool.malattie.forEach(x => this.newMalattie.push(x));
        }    
        this.editMalattie = true;
    }

    onMalattieSave() {
        let handler = () => {
            this.editMalattie = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.malattie = this.newMalattie;
    
            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
            }, err => {
                // TODO handle error
                this.editMalattie = true;                    
            });    
        }
        this.checkNonSavedValue(this.newMalattia, handler);
    }

    onMalattieCancel() {
        this.editMalattie = false;
    }

    addMalattia(malattia: string) {
        if (malattia !== undefined && malattia.trim() !== '')
            if (this.newMalattie.findIndex(x => x.toLowerCase() === malattia.toLowerCase()) < 0)
                this.newMalattie.push(malattia);
            else {
                let alert = this.alertCtrl.create();
                alert.setSubTitle('Voce già presente');
                alert.addButton('OK');
                alert.present();
            }
        this.newMalattia = '';
    }

    removeMalattia(malattia: string) {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.newMalattie.splice(this.newMalattie.findIndex(x => x.toLowerCase() === malattia.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }

    onBusEdit() {
        this.newBuses = [];
        this.newBus = '';
        if (this.selectedSchool.buses) {
            this.selectedSchool.buses.forEach(bus => this.newBuses.push(bus));
        }
        this.editBus = true;
    }

    onBusSave() {
        let handler = () => {
            this.editBus = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.buses = this.newBuses;

            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
            }, err => {
                // TODO handle error
                this.editBus = true;                    
            });    
        }
        this.checkNonSavedValue(this.newBus, handler);
    }

    onBusCancel() {
        this.editBus = false;
    }

    addBus(bus: string) {
        if (bus !== undefined && bus.trim() !== '') {
            if (!this.newBuses) {
                this.newBuses = [];
                this.newBuses.push(new Bus(bus));
                this.newBus = '';                
            }
            else {
                if (this.newBuses.findIndex(x => x.busId.toLowerCase() === bus.toLowerCase()) < 0) {
                    this.newBuses.push(new Bus(bus));
                    this.newBus = '';                    
                } else {
                    let alert = this.alertCtrl.create();
                    alert.setSubTitle('Voce già presente');
                    alert.addButton('OK');
                    alert.present();
                }
            }
        }    
    }

    removeBus(bus: Bus) {
        let alert = this.alertCtrl.create({
            title: 'Conferma eliminazione',
            subTitle:'Attenzione: ricordarsi di aggiornare le informazioni dei bambini associati a questa linea.',
            cssClass:'alertWarningCss',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.newBuses.splice(this.newBuses.findIndex(x => x.busId.toLowerCase() === bus.busId.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }

    private checkNonSavedValue(field: string, handler) {
        if (field) {
            let alert = this.alertCtrl.create({
                subTitle: `Valore '${field}' non è stato ancora aggiunto e non sarà salvato. Procedere?`,
                buttons: [
                    {
                        text: "Annulla"
                    },
                    {
                        text: 'OK',
                        handler: handler
                    }
                ]
            })
            alert.present();
        } else {
            handler();
        }
    }
}