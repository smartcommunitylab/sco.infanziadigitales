import { Parent } from './../../../../app/Classes/parent';
import { Delega } from './../../../../app/Classes/delega';
import { AlertController } from 'ionic-angular';
import { Service } from './../../../../app/Classes/service';
import { Group } from './../../../../app/Classes/group';
import { School } from './../../../../app/Classes/school';
import { BusService } from './../../../../app/Classes/busService';
import { Bus } from './../../../../app/Classes/bus';
import { Stop } from './../../../../app/Classes/stop';
import { Kid } from './../../../../app/Classes/kid';
import { WebService } from './../../../../services/WebService';
import { ConfigService } from './../../../../services/config.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Location } from '@angular/common';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { Http, Headers, BaseRequestOptions, RequestOptions } from '@angular/http';

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
ion-select {
max-width: 100%;
width: 100%;
}

.item-select ion-label {
max-width: 75px;
min-width: 75px;
}

#select-option {
margin-right: auto;
width: 100%;
}
    `]
})

export class KidPage implements OnInit {
    @Input() selectedKid: Kid;
    @Input() selectedSchool: School
    @Input() kidClick: boolean[];
    @Input() edit: boolean = false;

    thisKid: Kid = new Kid('', '', '');

    selectedKidGroups: Group[];

    kidSettings: string = 'info';

    newAllergia: string;

    selectedDelega: Delega;
    isNewD: boolean = false;
    editD: boolean = false;

    isNew: boolean = false;
    apiUrl: string;
    servicesChecked = {};
    editBus: boolean = false;
    newStop: string = "";
    uploader: FileUploader = new FileUploader({});
    rerender = false;

    constructor(
        private webService: WebService,
        private configService: ConfigService,
        private alertCtrl: AlertController,
        private http: Http,
        private cdRef: ChangeDetectorRef
    ) {
        this.apiUrl = this.configService.getConfig('apiUrl');
    }

    ngOnInit(): void {
        this.thisKid = this.selectedKid;
        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);

        this.isNew = this.thisKid.id == '';
        this.editInfo = this.isNew;

        this.thisKid.services.forEach(x => this.servicesChecked[x.servizio] = true);
        if (!this.thisKid.bus) {
            this.thisKid.bus = new BusService();
        }
    }
    doRerender() {
        this.rerender = true;
        this.cdRef.detectChanges();
        this.rerender = false;
    }
    goBack() {
        if (this.edit && this.thisKid.name !== '' && this.thisKid.id !== '' && this.thisKid.surname !== '') {
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

    editInfo: boolean;
    oldInfo: Kid = new Kid('', '', '');
    onInfoEdit() {
        this.editInfo = true;
        this.oldInfo.id = this.thisKid.id;
        this.oldInfo.name = this.thisKid.name;
        this.oldInfo.surname = this.thisKid.surname;
        this.oldInfo.nascita = this.thisKid.nascita;
        this.oldInfo.sperimentazione = this.thisKid.sperimentazione;
    }

    onInfoSave() {
        this.editInfo = false;
        if (this.isNew) {
            if (this.selectedSchool.kids.findIndex(x => x.id.toLowerCase() === this.thisKid.id.toLowerCase()) >= 0) {
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

        // FIX for strange issue
        this.thisKid.services = this.thisKid.services.filter(service => service != undefined);
        this.webService.add(this.selectedSchool.id, this.thisKid);

        // TO IMPROVE
        this.isNew = false;
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
    oldFoto: string;

    onFotoEdit() {
        this.editFoto = true;
        this.oldFoto = this.thisKid.image;
    }

    onFotoSave() {
        //upload image
        //    this.uploader.queue[0].withCredentials = false;
        //        this.uploader.onBuildItemForm = (item, form) => {
        //   form.append("image", item);
        // };
        //this.uploader.uploadItem(this.uploader.queue[0]);
        // this.webService.uploadDocument(this.uploader, this.uploader.queue[0], this.selectedSchool, this.selectedKid)
        this.webService.uploadDocumentInPromise(this.uploader, this.uploader.queue[0], this.selectedSchool, this.selectedKid).then(() => {
            // this.getImage(this.selectedKid)
            this.doRerender();
        },
            (err) => {
                console.log(err);
            });
        this.webService.update(this.selectedSchool);
        this.doRerender();
        this.editFoto = false;
        this.saveClick();

        // this.uploader.onCompleteItem = (item, response, status, headers) => {
        //     if (status == 200) {
        //         console.log('upload complete for ' + item.file.name);

        //     }
        // }


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

    editAllergia: boolean;
    oldAll: string[];

    onAllergiaEdit() {
        this.oldAll = [];
        this.editAllergia = true;
        this.thisKid.allergie.forEach(x => this.oldAll.push(x));
    }

    onAllergiaSave() {
        this.editAllergia = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onAllergiaCancel() {
        this.thisKid.allergie = [];
        this.oldAll.forEach(x => this.thisKid.allergie.push(x));
        this.editAllergia = false;
    }

    addAllergia(all: string) {
        if (all !== undefined && all !== '')
            if (this.thisKid.allergie.findIndex(x => x.toLowerCase() === all.toLowerCase()) < 0 && all !== '')
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
        this.thisKid.allergie.splice(this.thisKid.allergie.findIndex(x => x.toLowerCase() === all.toLowerCase()), 1);
    }

    editService: boolean;
    oldService: Service[];
    oldChecked = {};

    onServiceEdit() {
        this.editService = true;
    }

    onServiceSave() {
        this.editService = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onServiceCancel() {
        this.editService = false;
    }

    changeServices() {
        var x = new Array();
        for (var i in this.servicesChecked) {
            if (this.servicesChecked[i]) {
                x.push(this.selectedSchool.servizi.find(c => c.servizio && c.servizio.toLowerCase() === i.toLowerCase()));
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
        if (this.isNew) {
            this.edit = false;
            this.goBack();
        }
        else {
            Object.assign(this.thisKid, this.selectedKid);
            this.edit = !this.edit;
        }
    }

    editP1Info: boolean;
    oldParent1: Parent = new Parent('', '', '');

    onP1InfoEdit() {
        this.oldParent1.id = this.thisKid.parent1.id;
        this.oldParent1.name = this.thisKid.parent1.name;
        this.oldParent1.surname = this.thisKid.parent1.surname;
        this.editP1Info = true;
    }

    onP1InfoSave() {
        this.editP1Info = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onP1InfoCancel() {
        this.thisKid.parent1.id = this.oldParent1.id;
        this.thisKid.parent1.name = this.oldParent1.name;
        this.thisKid.parent1.surname = this.oldParent1.surname;
        this.editP1Info = false;
    }

    editP1Contatti: boolean;

    onP1ContattiEdit() {
        this.editP1Contatti = true;
    }

    onP1ContattiSave() {
        this.editP1Contatti = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onP1ContattiCancel() {
        this.editP1Contatti = false;
    }

    editP2Info: boolean;
    oldParent2: Parent = new Parent('', '', '');

    onP2InfoEdit() {
        this.oldParent2.id = this.thisKid.parent2.id;
        this.oldParent2.name = this.thisKid.parent2.name;
        this.oldParent2.surname = this.thisKid.parent2.surname;
        this.editP2Info = true;
    }

    onP2InfoSave() {
        this.editP2Info = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onP2InfoCancel() {
        this.thisKid.parent2.id = this.oldParent2.id;
        this.thisKid.parent2.name = this.oldParent2.name;
        this.thisKid.parent2.surname = this.oldParent2.surname;
        this.editP2Info = false;
    }

    editP2Contatti: boolean;

    onP2ContattiEdit() {
        this.editP2Contatti = true;
    }

    onP2ContattiSave() {
        this.editP2Contatti = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onP2ContattiCancel() {
        this.editP2Contatti = false;
    }

    addDelega() {
        // if(!this.isNewD) {
        this.isNewD = true;
        this.selectedDelega = new Delega('', '', '');
        this.editD = true;
        // }
        // else {
        //     //reset field
        //     this.selectedDelega = new Delega('', '' ,'');
        //     this.editD = true;
        // }
    }

    onSelectDelega(delega: Delega) {
        this.selectedDelega = delega;
    }

    onDeleteDelega(delega: Delega) {
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
                        this.webService.add(this.selectedSchool.id, this.thisKid);
                    }
                }
            ]
        })
        alert.present();
    }

    editDelegaInfo: boolean;
    oldDelega: Delega = new Delega('', '', '');

    onDelegaInfoEdit() {
        this.editDelegaInfo = true;
    }

    onDelegaInfoSave() {
        this.editDelegaInfo = false;
        if (this.isNewD)
            if (this.selectedDelega !== undefined && this.selectedDelega.id !== '')
                if (this.selectedKid.deleghe.findIndex(x => this.selectedDelega.id.toLowerCase() === x.id.toLowerCase()) < 0)
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
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onDelegaInfoCancel() {
        this.editDelegaInfo = false;
    }

    editDelegaContatti: boolean;

    onDelegaContattiEdit() {
        this.editDelegaContatti = true;
    }

    onDelegaContattiSave() {
        this.editDelegaContatti = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onDelegaContattiCancel() {
        this.editDelegaContatti = false;
    }

    editDelegaAutor: boolean;

    onDelegaAutorEdit() {
        this.editDelegaAutor = true;
    }

    onDelegaAutorSave() {
        this.editDelegaAutor = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onDelegaAutorCancel() {
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
        if (this.isNewD) { this.isNewD = false; this.selectedDelega = undefined }
        this.editD = false;
    }
    getImage(child) {
        var image = this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + child.id + "/" + sessionStorage.getItem('access_token');
        return image;
    }
    getUploadUrl() {
        var image = this.apiUrl + "/consoleweb/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/kid/" + this.thisKid.id + "/picture";
        return image;
    }
    onBusEdit() {
        this.editBus = true;
    }

    onBusSave() {
        this.editBus = false;
        this.webService.add(this.selectedSchool.id, this.thisKid);
    }

    onBusCancel() {
        this.editBus = false;
    }

    addStop(stop: string) {
        if (stop !== undefined && stop.trim() !== '')
            if (!this.thisKid.bus) {
                this.thisKid.bus = new BusService();
                this.thisKid.bus.stops.push(new Stop(stop));

            }
            else {
                if (this.thisKid.bus.stops.findIndex(x => x.stopId.toLowerCase() === stop.toLowerCase()) < 0)
                    this.thisKid.bus.stops.push(new Stop(stop));
                else {
                    let alert = this.alertCtrl.create();
                    alert.setSubTitle('Voce già presente');
                    alert.addButton('OK');
                    alert.present();
                }
            }
        this.newStop = "";
    }

    removeStop(stop: Stop) {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.thisKid.bus.stops.splice(this.thisKid.bus.stops.findIndex(x => x.stopId.toLowerCase() === stop.stopId.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }
}