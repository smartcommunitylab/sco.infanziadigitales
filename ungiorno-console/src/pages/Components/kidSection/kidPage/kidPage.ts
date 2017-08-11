import { Parent } from './../../../../app/Classes/parent';
import { Delega } from './../../../../app/Classes/delega';
import { AlertController } from 'ionic-angular';
import { Service } from './../../../../app/Classes/service';
import { Group } from './../../../../app/Classes/group';
import { School } from './../../../../app/Classes/school';
import { Kid } from './../../../../app/Classes/kid';
import { WebService } from './../../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'kidPage',
    templateUrl: 'kidPage.html',
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
        .datetime-disabled {
            padding: 0 0 0 8px;
            border: 0;
            margin-right: 18px;
            opacity: 1;
        }
        #giord {
            border: solid 1px black;
            border-radius: 7px 7px 7px 7px;
            padding: 4px 0 4px 8px;
            margin: 0;
            width: 95%;
        }
        .segment-button {
            border-bottom: 4px solid #98ba3c;
            font-size: 14px;
            font-weight: bold;
        }
        .segment-button.segment-activated {
            border-bottom: 4px solid #98ba3c
        }
        ion-segment-button.segment-activated {
            background-color : #98ba3c;
        }
    `]
})

export class KidPage implements OnInit{ 
    @Input() selectedKid : Kid;
    @Input() selectedSchool : School
    @Input() kidClick : boolean[];
    @Input() edit:boolean = false;

    thisKid : Kid = new Kid('', '', '');

    selectedKidGroups : Group[];

    kidSettings:string = 'info';

    newAllergia : string;

    selectedDelega : Delega;
    isNewD : boolean = false;
    editD : boolean = false;

    isNew : boolean = false;

    servicesChecked = {};

    constructor(
        private webService : WebService,
        private alertCtrl : AlertController
        ) { }

    ngOnInit(): void {    
        this.thisKid = JSON.parse(JSON.stringify(this.selectedKid)) as Kid;
        // Object.assign(this.thisKid, this.selectedKid)
        // this.thisKid.allergie = new Array();
        // this.selectedKid.allergie.forEach(x => this.thisKid.allergie.push(x));
        // this.thisKid.deleghe = new Array();
        // this.selectedKid.deleghe.forEach(x => this.thisKid.deleghe.push(x));
        // this.thisKid.ritiro = new Array();
        // this.selectedKid.ritiro.forEach(x => this.thisKid.ritiro.push(x));
        // this.thisKid.services = new Array();
        // this.selectedKid.services.forEach(x => this.thisKid.services.push(x));

        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);

        this.isNew = this.thisKid.id == ''; 
        this.editInfo = this.isNew;

        this.thisKid.services.forEach(x=> this.servicesChecked[x.servizio] = true);
    }

    goBack() {
        if(this.edit && this.thisKid.name !== '' && this.thisKid.id !== '' && this.thisKid.surname !== '') {
            let alert = this.alertCtrl.create({
                subTitle: 'Salvare prima di uscire?',            
            });
            alert.addButton({
                text: 'No',
                handler: () => {
                    this.kidClick[0] = false;
                }
            });
            alert.addButton({
                text: 'Sì',
                handler: () => {
                    this.saveClick();
                    this.kidClick[0] = false;
                }
            })
            alert.present();
        }
        else this.kidClick[0] = false;
    }

    editInfo:boolean;
    oldInfo:Kid = new Kid('', '', '');
    onInfoEdit() {
        this.editInfo = true;
        this.oldInfo.id = this.thisKid.id;
        this.oldInfo.name = this.thisKid.name;
        this.oldInfo.surname = this.thisKid.surname;
        this.oldInfo.nascita = this.thisKid.nascita;
        this.oldInfo.sperimentazione = this.thisKid.sperimentazione;
    }

    onInfoSave() {
        this.webService.update(this.selectedSchool);
        this.editInfo = false;
        if(this.isNew) {
            if(this.selectedSchool.kids.findIndex(x => x.id.toLowerCase() === this.thisKid.id.toLowerCase()) >= 0) {
                let alert = this.alertCtrl.create({
                    subTitle: 'Elemento già presente',
                    buttons: [
                        {
                            text: 'OK'
                        }
                    ]
                });
                alert.present();
            }
            else {
                this.selectedKid.services.push(this.selectedSchool.servizi.find(x => x.normale));
                this.selectedSchool.kids.push(this.selectedKid);              
            }
        }
        this.webService.update(this.selectedSchool);
        this.saveClick();
    }

    onInfoCancel() {
        this.thisKid.id = this.oldInfo.id;
        this.thisKid.name = this.oldInfo.name;
        this.thisKid.surname = this.oldInfo.surname;
        this.thisKid.nascita = this.oldInfo.nascita;
        this.thisKid.sperimentazione = this.oldInfo.sperimentazione;
        this.editInfo = false;
    }

    editFoto: boolean;
    oldFoto : string;

    onFotoEdit() {
        this.editFoto = true;
        this.oldFoto = this.thisKid.image;
    }

    onFotoSave() {
        this.webService.update(this.selectedSchool);
        this.editFoto = false;
        this.saveClick();
    }

    onFotoCancel() {
        this.thisKid.image = this.oldFoto;
        this.editFoto = false;
    }

    addImage(e) {
        
    }

    handleChange(e) {
        console.log(e.target.value);
    }

    editAllergia : boolean;
    oldAll:string[];

    onAllergiaEdit() {
        this.oldAll = [];
        this.editAllergia = true;
        this.thisKid.allergie.forEach(x=>this.oldAll.push(x));
    }

    onAllergiaSave() {
        this.webService.update(this.selectedSchool);
        this.editAllergia = false;
        this.saveClick();
    }

    onAllergiaCancel() {
        this.thisKid.allergie = [];
        this.oldAll.forEach(x=>this.thisKid.allergie.push(x));
        this.editAllergia = false;
    }

    addAllergia(all : string) {
        if(all !== undefined && all !== '') 
            if(this.thisKid.allergie.findIndex(x=>x.toLowerCase() === all.toLowerCase()) < 0 && all !== '')
                this.thisKid.allergie.push(all);
            else {
                let alert = this.alertCtrl.create();
                alert.setSubTitle('Voce già presente');
                alert.addButton('OK');
                alert.present();
            }
        this.newAllergia = '';
    }

    removeAllergia(all: string) {
        this.thisKid.allergie.splice(this.thisKid.allergie.findIndex(x=>x.toLowerCase() === all.toLowerCase()), 1);
    }

    editService : boolean;
    oldService : Service[];
    oldChecked = {};

    onServiceEdit() {
        this.oldService = [];
        this.thisKid.services.forEach(x => this.oldService.push(x));
        this.oldChecked = JSON.parse(JSON.stringify(this.servicesChecked));
        this.editService = true;
    }

    onServiceSave() {
        this.webService.update(this.selectedSchool);
        this.editService = false;
        this.saveClick();
    }

    onServiceCancel() {
        this.thisKid.services = [];
        this.oldService.forEach(x=>this.thisKid.services.push(x));
        this.servicesChecked = JSON.parse(JSON.stringify(this.oldChecked));
        this.editService = false;
    }

    changeServices() {
        var x = new Array();
        for(var i in this.servicesChecked) {
            if(this.servicesChecked[i]) {
               x.push(this.selectedSchool.servizi.find(c => c.servizio.toLowerCase() === i.toLowerCase()));
            }
        }
        this.thisKid.services = x
    }

    editClick() {
        this.edit = !this.edit;
    }

    saveClick() {
        Object.assign(this.selectedKid, this.thisKid)
        this.selectedKid.allergie = new Array();
        this.thisKid.allergie.forEach(x => this.selectedKid.allergie.push(x));
        this.selectedKid.deleghe = new Array();
        this.thisKid.deleghe.forEach(x => this.selectedKid.deleghe.push(x));
        this.selectedKid.ritiro = new Array();
        this.thisKid.ritiro.forEach(x => this.selectedKid.ritiro.push(x));
        this.selectedKid.services = new Array();
        this.thisKid.services.forEach(x => this.selectedKid.services.push(x));

        this.webService.update(this.selectedSchool);
        this.edit = false;
    }

    cancelClick() {
        if(this.isNew) {
            this.edit = false;
            this.goBack();
        }
        else {
            Object.assign(this.thisKid, this.selectedKid);
            this.edit = !this.edit;
        }
    }

    editP1Info : boolean;
    oldParent1: Parent = new Parent('', '', '');

    onP1InfoEdit() {
        this.oldParent1.id = this.thisKid.parent1.id;
        this.oldParent1.name = this.thisKid.parent1.name;
        this.oldParent1.surname = this.thisKid.parent1.surname;
        this.editP1Info = true;
    }

    onP1InfoSave() {
        this.webService.update(this.selectedSchool);
        this.editP1Info = false;
        this.saveClick();
    }

    onP1InfoCancel() {
        this.thisKid.parent1.id = this.oldParent1.id;
        this.thisKid.parent1.name = this.oldParent1.name;
        this.thisKid.parent1.surname = this.oldParent1.surname;
        this.editP1Info = false;
    }

    editP1Contatti : boolean;

    onP1ContattiEdit() {
        this.oldParent1.telephone = this.thisKid.parent1.telephone;
        this.oldParent1.cellphone = this.thisKid.parent1.cellphone;
        this.oldParent1.email = this.thisKid.parent1.email;
        this.editP1Contatti = true;
    }

    onP1ContattiSave() {
        this.webService.update(this.selectedSchool);
        this.editP1Contatti = false;
        this.saveClick();
    }

    onP1ContattiCancel() {
        this.thisKid.parent1.telephone = this.oldParent1.telephone;
        this.thisKid.parent1.cellphone = this.oldParent1.cellphone;
        this.thisKid.parent1.email = this.oldParent1.email;
        this.editP1Contatti = false;
    }

    editP2Info : boolean;
    oldParent2: Parent = new Parent('', '', '');

    onP2InfoEdit() {
        this.oldParent2.id = this.thisKid.parent2.id;
        this.oldParent2.name = this.thisKid.parent2.name;
        this.oldParent2.surname = this.thisKid.parent2.surname;
        this.editP2Info = true;
    }

    onP2InfoSave() {
        this.webService.update(this.selectedSchool);
        this.editP2Info = false;
        this.saveClick();
    }

    onP2InfoCancel() {
        this.thisKid.parent2.id = this.oldParent2.id;
        this.thisKid.parent2.name = this.oldParent2.name;
        this.thisKid.parent2.surname = this.oldParent2.surname;
        this.editP2Info = false;
    }

    editP2Contatti : boolean;

    onP2ContattiEdit() {
        this.oldParent2.telephone = this.thisKid.parent2.telephone;
        this.oldParent2.cellphone = this.thisKid.parent2.cellphone;
        this.oldParent2.email = this.thisKid.parent2.email;
        this.editP2Contatti = true;
    }

    onP2ContattiSave() {
        this.webService.update(this.selectedSchool);
        this.editP2Contatti = false;
        this.saveClick();
    }

    onP2ContattiCancel() {
        this.thisKid.parent2.telephone = this.oldParent2.telephone;
        this.thisKid.parent2.cellphone = this.oldParent2.cellphone;
        this.thisKid.parent2.email = this.oldParent2.email;
        this.editP2Contatti = false;
    }

    addDelega() {
        if(!this.isNewD) {
            this.isNewD = true;
            this.selectedDelega = new Delega('', '' ,'');
            this.editD = true;
        }
    }

    onSelectDelega(delega: Delega) {
        this.selectedDelega = delega;
        // Object.assign(this.selectedDelega, delega);
    }

    onDeleteDelega(delega : Delega) {
        let alert = this.alertCtrl.create({
        subTitle: 'Conferma eliminazione',
        buttons: [
            {
            text: "Annulla"
            },
            {
            text: 'OK',
            handler: () => {
                this.thisKid.deleghe.splice(this.thisKid.deleghe.findIndex(tmp => tmp.id === delega.id), 1);
                this.saveClick();
            }
            }
        ]
        })
        alert.present();
    }

    editDelegaInfo : boolean;
    oldDelega : Delega = new Delega('', '', '');

    onDelegaInfoEdit() {
        this.oldDelega.id = this.selectedDelega.id;
        this.oldDelega.name = this.selectedDelega.name;
        this.oldDelega.surname = this.selectedDelega.surname;
        this.oldDelega.legame = this.selectedDelega.legame;
        this.editDelegaInfo = true;
    }

    onDelegaInfoSave() {
        this.webService.update(this.selectedSchool);
        this.editDelegaInfo = false;
        if(this.isNewD)
            if(this.selectedDelega !== undefined && this.selectedDelega.id !== '')
                if(this.selectedKid.deleghe.findIndex(x => this.selectedDelega.id.toLowerCase() === x.id.toLowerCase()) < 0)
                    this.thisKid.deleghe.push(this.selectedDelega)
                else {
                    let alert = this.alertCtrl.create({
                        subTitle: 'Elemento già presente',
                        buttons: [
                            {
                                text: 'OK'
                            }
                        ]
                    });
                    alert.present();
                }
        this.saveDClick();
    }

    onDelegaInfoCancel() {
        this.selectedDelega.id = this.oldDelega.id;
        this.selectedDelega.name = this.oldDelega.name;
        this.selectedDelega.surname = this.oldDelega.surname;
        this.selectedDelega.legame = this.oldDelega.legame;
        this.editDelegaInfo = false;
    }

    editDelegaContatti:boolean;

    onDelegaContattiEdit() {
        this.oldDelega.telephone = this.selectedDelega.telephone;
        this.oldDelega.cellphone = this.selectedDelega.cellphone;
        this.oldDelega.email = this.selectedDelega.email;
        this.editDelegaContatti = true;
    }

    onDelegaContattiSave() {
        this.webService.update(this.selectedSchool);
        this.editDelegaContatti = false;
        this.saveDClick();
    }

    onDelegaContattiCancel() {
        this.selectedDelega.telephone = this.oldDelega.telephone;
        this.selectedDelega.cellphone = this.oldDelega.cellphone;
        this.selectedDelega.email = this.oldDelega.email;
        this.editDelegaContatti = false;
    }

    editDelegaAutor : boolean;

    onDelegaAutorEdit() {
        this.oldDelega.scadenza = JSON.parse(JSON.stringify(this.selectedDelega.scadenza));
        this.oldDelega.maggiorenne = this.selectedDelega.maggiorenne;
        this.editDelegaAutor = true;
    }

    onDelegaAutorSave() {
        this.webService.update(this.selectedSchool);
        this.editDelegaAutor = false;
        this.saveDClick();
    }

    onDelegaAutorCancel() {
        this.selectedDelega.scadenza = JSON.parse(JSON.stringify(this.oldDelega.scadenza));
        this.selectedDelega.maggiorenne = this.oldDelega.maggiorenne;
        this.editDelegaAutor = false;
    }


    saveDClick() {
        this.isNewD = false;
        this.editD = false;
        this.edit = false;
        this.saveClick();
    }

    editDClick() {
        this.editD = !this.editD;
    }

    cancelDClick() {
        if(this.isNewD) {this.isNewD = false;  this.selectedDelega = undefined}
        this.editD = false;
    }
}