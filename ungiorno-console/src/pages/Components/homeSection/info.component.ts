import { WebService } from './../../../app/WebService';
import { AlertController } from 'ionic-angular';
import { School } from './../../../app/Classes/school';
import { Component, OnInit, Input } from '@angular/core';

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


export class Info {
    @Input() selectedSchool: School;

    newAssenza:string;
    editAssenze:boolean = false;

    newMalattia : string;
    editMalattie:boolean = false;

    editContatti : boolean = false;

    isMalattiaEnabled : boolean;

    constructor(private alertCtrl:AlertController, private webService : WebService) {}

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
                text: 'Annulla',
                role: 'cancel'
                },
                {
                text: 'Salva',
                handler: data => {
                    this.selectedSchool.telephone = data.tel;
                    this.selectedSchool.email = data.email;
                    this.webService.update(this.selectedSchool);
                }
                }
            ],
            enableBackdropDismiss : false
        });
        prompt.present();
    }

    oldTel:string; oldMail:string;
    onContattiEdit() {
        this.editContatti = true;
        if(this.editContatti) {
            this.oldTel = this.selectedSchool.telephone;
            this.oldMail = this.selectedSchool.email;
        }
    }

    onContattiSave() {
        this.webService.update(this.selectedSchool);
        this.editContatti = false;
    }

    onContattiCancel() {
        this.selectedSchool.email = this.oldMail;
        this.selectedSchool.telephone = this.oldTel;
        this.editContatti = false;
    }

    oldMal : boolean;
    oldMf : boolean;
    oldAsse : string[] = [];
    onAssenzeEdit() {
        this.oldAsse = [];
        this.selectedSchool.assenze.forEach(x=>this.oldAsse.push(x));

        this.oldMf = this.selectedSchool.familiari;
        this.oldMal = this.selectedSchool.malattia;

        this.isMalattiaEnabled = this.selectedSchool.malattia;
        this.editAssenze = true;
    }

    onAssenzeSave() {
        this.selectedSchool.malattia = this.isMalattiaEnabled;
        this.webService.update(this.selectedSchool);
        this.editAssenze = false;
        this.newAssenza = '';
    }

    onAssenzeCancel() {
        this.selectedSchool.assenze = [];
        this.oldAsse.forEach(x=>this.selectedSchool.assenze.push(x));

        this.selectedSchool.malattia = this.oldMal;
        this.selectedSchool.familiari = this.oldMf;

        this.editAssenze = false;
        this.newAssenza = '';
    }

    addAssenza(assenza:string) {
        if(assenza !== undefined && assenza !== '')
            if(this.selectedSchool.assenze.findIndex(x=>x.toLowerCase() === assenza.toLowerCase()) < 0)
                this.selectedSchool.assenze.push(assenza);
            else {
                let alert = this.alertCtrl.create();
                alert.setSubTitle('Voce già presente');
                alert.addButton('OK');
                alert.present();
            }
        this.newAssenza = '';
    }

    removeAssenza(assenza:string) {
        let alert = this.alertCtrl.create({
        subTitle: 'Conferma eliminazione',
        buttons: [
            {
            text: "Annulla"
            },
            {
            text: 'OK',
            handler: () => {
                this.selectedSchool.assenze.splice(this.selectedSchool.assenze.findIndex(x=>x.toLowerCase() === assenza.toLowerCase()), 1);
            }
            }
        ]
        })
        alert.present();
    }

    oldMals : string[];
    onMalattieEdit() {
        this.oldMals = [];
        this.selectedSchool.malattie.forEach(x=>this.oldMals.push(x));
        this.editMalattie = true;
    }

    onMalattieSave() {
        this.webService.update(this.selectedSchool);
        this.editMalattie = false;
    }
    
    onMalattieCancel() {
        this.selectedSchool.malattie = [];
        this.oldMals.forEach(x=>this.selectedSchool.malattie.push(x));
        this.editMalattie = false;
    }

    addMalattia(malattia:string) {
        if(malattia !== undefined && malattia.trim() !== '')
            if(this.selectedSchool.malattie.findIndex(x=>x.toLowerCase() === malattia.toLowerCase()) < 0)
                this.selectedSchool.malattie.push(malattia);
            else{
                let alert = this.alertCtrl.create();
                alert.setSubTitle('Voce già presente');
                alert.addButton('OK');
                alert.present();
            }
        this.newMalattia = '';
    }

    removeMalattia(malattia:string) {
        let alert = this.alertCtrl.create({
        subTitle: 'Conferma eliminazione',
        buttons: [
            {
                text: "Annulla"
            },
            {
                text: 'OK',
                handler: () => {
                    this.selectedSchool.malattie.splice(this.selectedSchool.malattie.findIndex(x=>x.toLowerCase() === malattia.toLowerCase()), 1);
                }
            }
        ]
        })
        alert.present();
    }
}