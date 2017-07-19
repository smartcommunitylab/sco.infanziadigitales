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
    img {
        height: 100px;
        width: auto;
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

    onContattiEdit() {
        this.editContatti = !this.editContatti;
    }

    onAssenzeEdit() {
        this.editAssenze = !this.editAssenze;
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
        this.selectedSchool.assenze.splice(this.selectedSchool.assenze.findIndex(x=>x.toLowerCase() === assenza.toLowerCase()), 1);
    }

    onMalattieEdit() {
        this.editMalattie = !this.editMalattie;
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
        this.selectedSchool.malattie.splice(this.selectedSchool.malattie.findIndex(x=>x.toLowerCase() === malattia.toLowerCase()), 1);
    }
}