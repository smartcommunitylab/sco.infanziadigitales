import { Parent } from './../../../../app/Classes/parent';
import { Delega } from './../../../../app/Classes/delega';
import { AlertController, ToastController } from 'ionic-angular';
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
      font-size: 18px;
      font-weight: bold;
    }
    .segment-button.segment-activated {
      border-bottom: 4px solid #98ba3c
    }
    ion-segment-button.segment-activated {
      background-color : #98ba3c;
    }
    .segment-md-light .segment-button.activated, .segment-md-light .segment-button.segment-activated {
  border-color: #f4f4f4;
  color: #f4f4f4;
  opacity: 1;
}
    .segment-md-light .segment-button {
    color: black;
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
    BreakEmailException = {};
    BreakPhoneException = {};
    toastWrongEmail;
    toastWrongPhone;
    orarioNormale = "";
    constructor(
        private webService: WebService,
        private configService: ConfigService,
        private alertCtrl: AlertController,
        private http: Http,
        private cdRef: ChangeDetectorRef,
        private toastCtrl: ToastController
    ) {
        this.apiUrl = this.configService.getConfig('apiUrl');
    }

    ngOnInit(): void {
        this.thisKid = this.selectedKid;
        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);

        this.isNew = this.thisKid.id == '';
        this.editInfo = this.isNew;

        this.selectedSchool.servizi.forEach(servizio => {
            this.servicesChecked[servizio.servizio] = false
            if (servizio.normale) {
                this.orarioNormale = servizio.servizio;
            }
        });
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
        else {
            let alert = this.alertCtrl.create({
                subTitle: 'Eventuali modifiche non salvate verrano perse. Confermi?',
                buttons: [
                    {
                        text: "Annulla"
                    },
                    {
                        text: 'OK',
                        handler: () => {
                            this.kidClick[0] = false;
                        }
                    }
                ]
            })
            alert.present();
        }
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
        this.webService.add(this.selectedSchool, this.thisKid);

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
    onRemoveProfileKid() {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma rimozione immagine',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.webService.removeKidImage(this.selectedSchool, this.selectedKid).then(() => {
                            this.doRerender();
                        },
                            (err) => {
                                console.log(err);
                            });
                        this.webService.update(this.selectedSchool);
                        this.doRerender();
                        this.editFoto = false;
                        this.saveClick();
                    }
                }
            ]
        })
        alert.present();

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
        this.webService.add(this.selectedSchool, this.thisKid);
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
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.thisKid.allergie.splice(this.thisKid.allergie.findIndex(x => x.toLowerCase() === all.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }

    editService: boolean;
    oldService: Service[];
    oldChecked = {};

    onServiceEdit() {
        this.editService = true;
        this.oldService = [];
        this.thisKid.services.forEach(x => this.oldService.push(x));
    }

    onServiceSave() {
        this.editService = false;
        this.webService.add(this.selectedSchool, this.thisKid);
    }

    onServiceCancel() {
        this.editService = false;
         this.thisKid.services = [];
        this.oldService.forEach(x => this.thisKid.services.push(x));
    }

    changeServices() {
        console.log('change servicesss')
        var x = new Array();
        for (var i in this.servicesChecked) {
            if (this.servicesChecked[i]) {
                let selectedSevice = this.selectedSchool.servizi.find(c => c.servizio && c.servizio.toLowerCase() === i.toLowerCase());
                if (selectedSevice != undefined) {
                    x.push(selectedSevice);
                }
            }
        }
        this.thisKid.services = x
        console.log(this.thisKid.services)
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
        this.webService.add(this.selectedSchool, this.thisKid);
    }

    onP1InfoCancel() {
        this.thisKid.parent1.id = this.oldParent1.id;
        this.thisKid.parent1.name = this.oldParent1.name;
        this.thisKid.parent1.surname = this.oldParent1.surname;
        this.editP1Info = false;
    }

    editP1Contatti: boolean;


    private validatePhone(email) {
        var re = /^[0-9]{5,10}$/;

        return re.test(email);
    }
    private validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    checkEmailAndPhones(parent: Parent) {
        parent.emails.forEach(email => {
            if (!this.validateEmail(email))
                throw this.BreakEmailException
        });
        parent.phoneNumbers.forEach(phone => {
            if (!this.validatePhone(phone))
                throw this.BreakPhoneException
        });
    }
    onP1ContattiEdit() {
        this.editP1Contatti = true;
        this.oldParent1.emails = this.thisKid.parent1.emails.slice();
        this.oldParent1.phoneNumbers = this.thisKid.parent1.phoneNumbers.slice();
    }

    onP1ContattiSave() {
        try {
            this.checkEmailAndPhones(this.thisKid.parent1)
            this.editP1Contatti = false;
            this.webService.add(this.selectedSchool, this.thisKid);
        } catch (e) {
            if (e == this.BreakEmailException) {
                this.toastWrongEmail = this.toastCtrl.create({
                    message: 'Formato email non valido',
                    duration: 1000,
                    position: 'middle',
                    dismissOnPageChange: true
                });
                this.toastWrongEmail.present()

            } else if (e == this.BreakPhoneException) {
                this.toastWrongPhone = this.toastCtrl.create({
                    message: 'Formato telefono non valido',
                    duration: 1000,
                    position: 'middle',
                    dismissOnPageChange: true

                });

                this.toastWrongPhone.present()
            }
        }
    }

    onP1ContattiCancel() {
        this.editP1Contatti = false;
        this.thisKid.parent1.emails = this.oldParent1.emails.slice();
        this.thisKid.parent1.phoneNumbers = this.oldParent1.phoneNumbers.slice();
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
        this.webService.add(this.selectedSchool, this.thisKid);
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
        this.oldParent2.emails = this.thisKid.parent2.emails.slice();
        this.oldParent2.phoneNumbers = this.thisKid.parent2.phoneNumbers.slice();
    }

    onP2ContattiSave() {
        // this.editP2Contatti = false;
        // if (this.checkEmailAndPhones(this.thisKid.parent1)) {
        //     this.webService.add(this.selectedSchool, this.thisKid);
        // } else {
        //     // Toast
        // }
        try {
            this.checkEmailAndPhones(this.thisKid.parent2)
            this.editP2Contatti = false;
            this.webService.add(this.selectedSchool, this.thisKid);
        } catch (e) {
            if (e == this.BreakEmailException) {
                this.toastWrongEmail = this.toastCtrl.create({
                    message: 'Formato email non valido',
                    duration: 1000,
                    position: 'middle',
                    dismissOnPageChange: true
                });
                this.toastWrongEmail.present()

            } else if (e == this.BreakPhoneException) {
                this.toastWrongPhone = this.toastCtrl.create({
                    message: 'Formato telefono non valido',
                    duration: 1000,
                    position: 'middle',
                    dismissOnPageChange: true
                });

                this.toastWrongPhone.present()
            }
        }

    }

    onP2ContattiCancel() {
        this.editP2Contatti = false;
        this.thisKid.parent2.emails = this.oldParent2.emails.slice();
        this.thisKid.parent2.phoneNumbers = this.oldParent2.phoneNumbers.slice();
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
                        this.webService.add(this.selectedSchool, this.thisKid);
                    }
                }
            ]
        })
        alert.present();
    }

    editDelegaInfo: boolean;
    oldDelega: Delega[] = [];

    onDelegaInfoEdit() {
        this.editDelegaInfo = true;
        this.oldDelega = [];
        this.thisKid.deleghe.forEach(x => this.oldDelega.push(x));
    }
    private findWord(array, word, field) {
        return -1 < array.map(function (item) {
            return item[field].toLowerCase();
        }).indexOf(word.toLowerCase());
    }
    private findDelega(array, delega) {
        var already=false;
        array.forEach(element => {
            if (element.name == delega.name &&  element.surname == delega.surname &&  element.legame == delega.legame)
            {
                already=true;
            }

        });
        return already;
    }
    onDelegaInfoSave() {
        this.editDelegaInfo = false;
        if (this.isNewD)
            if (this.selectedDelega !== undefined && this.selectedDelega.name.trim().length > 0 && this.selectedDelega.surname.trim().length > 0 && this.selectedDelega.legame.trim().length > 0) {
                if (this.findDelega(this.thisKid.deleghe,this.selectedDelega)){
                    let alert = this.alertCtrl.create({
                        subTitle: 'Identificatore già in uso',
                        buttons: [
                            {
                                text: 'OK'
                            }
                        ]
                    });
                    alert.present();
                } else {
                    this.thisKid.deleghe.push(this.selectedDelega)
                    this.selectedDelega = null;
                }

            }
        this.webService.add(this.selectedSchool, this.thisKid);
    }

    onDelegaInfoCancel() {
        this.editDelegaInfo = false;
        this.selectedDelega = null;
        this.oldDelega = [];
        this.thisKid.deleghe.forEach(x => this.oldDelega.push(x));
    }

    editDelegaContatti: boolean;

    onDelegaContattiEdit() {
        this.editDelegaContatti = true;
    }

    onDelegaContattiSave() {
        this.editDelegaContatti = false;
        this.webService.add(this.selectedSchool, this.thisKid);
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
        this.webService.add(this.selectedSchool, this.thisKid);
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

    oldBus:BusService = new BusService();
    onBusEdit() {
        this.editBus = true;
        this.oldBus = Object.assign({},this.thisKid.bus);
    }

    onBusSave() {
        this.editBus = false;
        this.webService.add(this.selectedSchool, this.thisKid);
    }

    onBusCancel() {
        this.editBus = false;
        this.thisKid.bus = this.oldBus;
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