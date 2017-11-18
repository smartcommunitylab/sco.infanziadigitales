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
import { CommonService } from  './../../../../services/common.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Location } from '@angular/common';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { Http, Headers, BaseRequestOptions, RequestOptions } from '@angular/http';

import { ViewChild } from '@angular/core';

import 'rxjs/add/operator/switchMap';
import { tmpdir } from 'os';

import { ListWidget }from '../../list-widget/list-widget';
import { setTimeout } from 'timers';

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

    //thisKid: Kid = new Kid('', '', '');

    selectedKidGroups: Group[];

    kidSettings: string = 'info';
    image = "";

    // data for info section
    editInfo: boolean;
    newInfo: Kid = new Kid('', '', '');
    // data for foto section
    editFoto: boolean;
    newFoto: string;
    // data for allergia section
    editAllergia: boolean;
    newAllergie: string[];
    newAllergia: string;
    // data for service section    
    editService: boolean;
    servicesChecked = {};
    orarioNormale = "";
    // data for 1st parent
    editP1Info: boolean;
    newParent1: Parent = new Parent('', '', '');
    editP1Contatti: boolean;
    @ViewChild('p1Phones') p1Phones;
    @ViewChild('p1Emails') p1Emails;
    // data for 2nd parent
    editP2Info: boolean;
    newParent2: Parent = new Parent('', '', '');
    editP2Contatti: boolean;
    @ViewChild('p2Phones') p2Phones;
    @ViewChild('p2Emails') p2Emails;
    // data for delega section    
    isNewD: boolean = false;
    editD: boolean = false;    
    selectedDelega: Delega;
    editDelegaInfo: boolean;    
    // data for bus section
    editBus: boolean = false;
    newBus: BusService = new BusService();
    newStop: string = "";

    // new kid is being created
    isNew: boolean = false;

    apiUrl: string;
    uploader: FileUploader = new FileUploader({});

    emailValidator = CommonService.emailValidator;
    phoneValidator = CommonService.phoneValidator;
    
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
        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);
        this.isNew = this.selectedKid.id == '';
        this.editInfo = this.isNew;
        this.initServices();
        this.image=this.getImage();

    }
    private initServices() {
        this.servicesChecked = {};
        this.selectedSchool.servizi.forEach(servizio => {
            this.servicesChecked[servizio.servizio] = false
            if (servizio.normale) {
                this.orarioNormale = servizio.servizio;
            }
        });
        this.selectedKid.services.forEach(x => this.servicesChecked[x.servizio] = true);
    }

    isInEdit(): boolean {
        return this.editInfo || this.editFoto || this.editAllergia || this.editService || this.editBus
            || this.editP1Info || this.editP1Contatti || this.editP2Info || this.editP2Contatti 
            || this.editDelegaInfo;
    }

    goBack() {
        if (!this.isInEdit()) {
            this.kidClick[0] = false;
            return;   
        }
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
        // }
    }

    onInfoEdit() {
        this.editInfo = true;
        this.newInfo.id = this.selectedKid.id;
        this.newInfo.name = this.selectedKid.name;
        this.newInfo.surname = this.selectedKid.surname;
        this.newInfo.nascita = this.selectedKid.nascita;
        this.newInfo.gender = this.selectedKid.gender;
        this.newInfo.nascitaStr = this.selectedKid.nascitaStr;
        this.newInfo.sperimentazione = this.selectedKid.sperimentazione;
    }

    onInfoSave() {
        this.editInfo = false;
        if (this.isNew) {
            if (this.selectedSchool.kids.findIndex(x => x.id.toLowerCase() === this.newInfo.id.toLowerCase()) >= 0) {
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

        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.id = this.newInfo.id;
        tmpKid.name = this.newInfo.name;
        tmpKid.surname = this.newInfo.surname;
        tmpKid.gender = this.newInfo.gender;
        tmpKid.nascita = this.newInfo.nascita;
        tmpKid.nascitaStr = this.newInfo.nascitaStr;
        tmpKid.sperimentazione = this.newInfo.sperimentazione;

        // FIX for strange issue
        tmpKid.services = tmpKid.services.filter(service => service != undefined);
        console.log(this.selectedKid.constructor.name)

        this.webService.addKid(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
            //this.syncKidObject();
        }, (err) => {
            //TODO
            this.editInfo = true;

        });

        // TO IMPROVE
        this.isNew = false;
    }

    onInfoCancel() {
        this.editInfo = false;
        if (this.isNew) {
            this.goBack();
        }
    }

    onFotoEdit() {
        this.editFoto = true;
        this.newFoto = this.selectedKid.image;
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
                            // this.doRerender();
                            this.image=this.getImage();
                        },
                            (err) => {
                                console.log(err);
                                this.editFoto = true;
                            });

                        this.editFoto = false;
                    }
                }
            ]
        })
        alert.present();

    }
    onFotoSave() {
        this.webService.uploadDocumentInPromise(this.uploader, this.uploader.queue[0], this.selectedSchool, this.selectedKid).then(() => {
            // this.doRerender();
            this.image=this.getImage();
        },
            (err) => {
                console.log(err);
                this.editFoto = true;

            });
        this.editFoto = false;

    }

    onFotoCancel() {
        this.editFoto = false;
    }

    onAllergiaEdit() {
        this.newAllergie = [];
        this.newAllergia = null;
        this.editAllergia = true;
        if (this.selectedKid.allergie != null) {
            this.selectedKid.allergie.forEach(x => this.newAllergie.push(x));
        }
    }

    onAllergiaSave() {
        let handler = () => {
            this.editAllergia = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.allergie = this.newAllergie;
            this.webService.add(this.selectedSchool, tmpKid).then(
                () => {
                    this.selectedKid.copyInto(tmpKid);
                }, (err) => {
                    this.editAllergia = true;
                });
        }
        this.checkNonSavedValue(this.newAllergia, handler);

    }

    onAllergiaCancel() {
        this.editAllergia = false;
        this.newAllergia = null;
    }

    addAllergia(all: string) {
        if (all !== undefined && all !== '')
            if (this.newAllergie.findIndex(x => x.toLowerCase() === all.toLowerCase()) < 0 && all !== '')
                this.newAllergie.push(all);
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
                        this.newAllergie.splice(this.newAllergie.findIndex(x => x.toLowerCase() === all.toLowerCase()), 1);
                    }
                }
            ]
        })
        alert.present();
    }

    onServiceEdit() {
        this.editService = true;

    }

    onServiceSave() {
        this.editService = false;
        let newService = [];
        this.selectedSchool.servizi.forEach(servizio => {
            if (this.servicesChecked[servizio.servizio]) {
                newService.push(servizio);
            }
        });
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.services = newService;
        this.webService.add(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
        }, (err) => {
            //TODO
            this.editService = true;
        })
    }

    onServiceCancel() {
        this.editService = false;
        this.initServices();

    }

    onP1InfoEdit() {
        this.newParent1.id = this.selectedKid.parent1.id;
        this.newParent1.name = this.selectedKid.parent1.name;
        this.newParent1.surname = this.selectedKid.parent1.surname;
        this.editP1Info = true;
    }

    onP1InfoSave() {
        this.editP1Info = false;
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.parent1 = this.newParent1;
        this.webService.add(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
        }, (err) => {
            this.editP1Info = true;
        })
    }

    onP1InfoCancel() {

        this.editP1Info = false;
    }

    onP1ContattiEdit() {
        this.editP1Contatti = true;
        this.newParent1.emails = this.selectedKid.parent1.emails.slice();
        this.newParent1.phoneNumbers = this.selectedKid.parent1.phoneNumbers.slice();
    }

    onP1ContattiSave() {
        let handler = () => {
            this.editP1Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent1 = this.newParent1;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
            }, (err) => {
                this.editP1Info = true;
            });    
        }
        this.checkNonSavedValue(this.p1Phones.newItem, () => {
            setTimeout(() => {
                this.checkNonSavedValue(this.p1Emails.newItem, handler);                
            },200);
        });
    }

    onP1ContattiCancel() {
        this.editP1Contatti = false;
    }

    onP2InfoEdit() {
        this.newParent2.id = this.selectedKid.parent2.id;
        this.newParent2.name = this.selectedKid.parent2.name;
        this.newParent2.surname = this.selectedKid.parent2.surname;
        this.editP2Info = true;
    }

    onP2InfoSave() {
        this.editP2Info = false;
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.parent2 = this.newParent2;
        this.webService.add(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
        }, (err) => {
            this.editP2Info = true;
        })
    }

    onP2InfoCancel() {
        this.editP2Info = false;
    }

    onP2ContattiEdit() {
        this.editP2Contatti = true;
        this.newParent2.emails = this.selectedKid.parent2.emails.slice();
        this.newParent2.phoneNumbers = this.selectedKid.parent2.phoneNumbers.slice();
    }

    onP2ContattiSave() {
        let handler = () => {
            this.editP2Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent2 = this.newParent2;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
            }, (err) => {
                this.editP1Info = true;
            });    
        }
        this.checkNonSavedValue(this.p2Phones.newItem, () => {
            setTimeout(() => {
                this.checkNonSavedValue(this.p2Emails.newItem, handler);                
            },200);
        });
    }

    onP2ContattiCancel() {
        this.editP2Contatti = false;

    }

    addDelega() {
        this.isNewD = true;
        this.selectedDelega = new Delega('', '', '');
        this.editD = true;
        this.editDelegaInfo = true;

    }

    onSelectDelega(delega: Delega) {
        this.editDelegaInfo = false;
        this.selectedDelega = new Delega(delega.id,delega.name,delega.surname,null,null,delega.legame);
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
                        this.selectedDelega = null;
                        this.editDelegaInfo =false;
                        let newDelega = this.selectedKid.deleghe.slice();
                        newDelega.splice(newDelega.findIndex(tmp => tmp.id === delega.id), 1);
                        let tmpKid = Kid.copy(this.selectedKid);
                        tmpKid.deleghe = newDelega
                        this.webService.add(this.selectedSchool, tmpKid).then(() => {
                            this.selectedKid.copyInto(tmpKid);
                            this.isNewD =false;
                        }, (err) => {
                            //TODO
                        });
                    }
                }
            ]
        })
        alert.present();
    }

    //newDelega: Delega[] = [];

    onDelegaInfoEdit() {
        this.editDelegaInfo = true;
       // this.newDelega = [];
        //this.selectedKid.deleghe.forEach(x => this.newDelega.push(x));
    }
    private findWord(array, word, field) {
        return -1 < array.map(function (item) {
            return item[field].toLowerCase();
        }).indexOf(word.toLowerCase());
    }
    private findDelega(array, delega) {
        var already = false;
        array.forEach(element => {
            if (element.id != delega.id && element.name == delega.name && element.surname == delega.surname && element.legame == delega.legame) {
                already = true;
            }

        });
        return already;
    }
    onDelegaInfoSave() {
        this.editDelegaInfo = false;
        //if (this.isNewD) {
            if (this.selectedDelega !== undefined && this.selectedDelega.name.trim().length > 0 && this.selectedDelega.surname.trim().length > 0 && this.selectedDelega.legame.trim().length > 0) {
                if (this.findDelega(this.selectedKid.deleghe, this.selectedDelega)) {
                    let alert = this.alertCtrl.create({
                        subTitle: 'Identificatore già in uso',
                        buttons: [
                            {
                                text: 'OK'
                            }
                        ]
                    });
                    this.editDelegaInfo = true;
                    alert.present();
                } else {
                    let newDelega = [];
                    if (this.selectedKid.deleghe!=null){
                        newDelega= this.selectedKid.deleghe.slice();
                    }
                    if (this.selectedDelega.id){
                        for (let i=0; i<newDelega.length;i++){
                            if (newDelega[i].id===this.selectedDelega.id){
                                newDelega[i]=this.selectedDelega;
                                break;
                            }
                        }
                    } else {
                        this.selectedDelega.id=this.selectedKid.id+"_"+new Date().getTime();
                        newDelega.push(this.selectedDelega);                        
                    }
                    let tmpKid = Kid.copy(this.selectedKid);
                    tmpKid.deleghe = newDelega;
                    this.webService.add(this.selectedSchool, tmpKid).then(() => {
                        this.selectedKid.copyInto(tmpKid);
                        this.selectedDelega = null;
                        this.isNewD = false;
                    }, (err) => {
                        //TODO
                        this.editDelegaInfo = true;
                        
                    });
                }

            }

    }

    onDelegaInfoCancel() {
        this.editDelegaInfo = false;
        this.selectedDelega = null;
        this.isNewD = false;

    }

     getImage() {
         return this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + this.selectedKid.id + "/" + sessionStorage.getItem('access_token')+"?timestamp="+new Date().getTime();
        // this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + this.selectedKid.id + "/" + sessionStorage.getItem('access_token')+"?timestamp="+new Date().getTime()     var image = this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + child.id + "/" + sessionStorage.getItem('access_token');
    //     return image;
     }
     
    onBusEdit() {
        this.editBus = true;
        this.newStop = "";
        this.newBus = new BusService();
        if (this.selectedKid.bus) {
            this.newBus.enabled = this.selectedKid.bus.enabled;
            this.newBus.stops = this.selectedKid.bus.stops.slice();
            this.newBus.busId = this.selectedKid.bus.busId;
        }

    }

    onBusSave() {
        let handler = () => {
            this.editBus = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.bus = this.newBus;
            this.webService.add(this.selectedSchool, tmpKid).then(()=> {
                this.selectedKid.copyInto(tmpKid);
            },(err)=>{
                //TODO
                this.editBus=true;
            });
        }
        this.checkNonSavedValue(this.newStop, handler);
    }

    onBusCancel() {
        this.editBus = false;
    }

    addStop(stop: string) {
        if (stop !== undefined && stop.trim() !== '')
            if (!this.newBus) {
                this.newBus = new BusService();
                this.newBus.stops.push(new Stop(stop));

            }
            else {
                if (this.newBus.stops.findIndex(x => x.stopId.toLowerCase() === stop.toLowerCase()) < 0)
                    this.newBus.stops.push(new Stop(stop));
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
                        this.newBus.stops.splice(this.newBus.stops.findIndex(x => x.stopId.toLowerCase() === stop.stopId.toLowerCase()), 1);
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