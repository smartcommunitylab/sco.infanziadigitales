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
import { tmpdir } from 'os';

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

    newAllergia: string;
    newKidBus: BusService;
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
        // this.thisKid = JSON.parse(JSON.stringify(this.selectedKid)) as Kid;
        //this.thisKid.copyInto(JSON.parse(JSON.stringify(this.selectedKid)));
        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);

        this.isNew = this.selectedKid.id == '';
        this.editInfo = this.isNew;

        this.initServices();
        // if (!this.selectedKid.bus) {
        //     this.newKidBus = new BusService();
        // } else {
        //     this.newKidBus
        // }
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
    doRerender() {
        this.rerender = true;
        this.cdRef.detectChanges();
        this.rerender = false;
    }
    goBack() {
        // if (this.edit && this.thisKid.name !== '' && this.thisKid.id !== '' && this.thisKid.surname !== '') {
        //     let alert = this.alertCtrl.create({
        //         subTitle: 'Salvare prima di uscire?',
        //     });
        //     alert.addButton({
        //         text: 'No',
        //         handler: () => {
        //             this.kidClick[0] = false;
        //         }
        //     });
        //     alert.addButton({
        //         text: 'Sì',
        //         handler: () => {
        //             this.syncKidObject();
        //             this.kidClick[0] = false;
        //         }
        //     })
        //     alert.present();
        // }
        // else {
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

    editInfo: boolean;
    newInfo: Kid = new Kid('', '', '');
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
        tmpKid.nascita = this.newInfo.nascita;
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
        // this.thisKid.id = this.oldInfo.id;
        // this.thisKid.name = this.oldInfo.name;
        // this.thisKid.surname = this.oldInfo.surname;
        // this.thisKid.nascita = this.oldInfo.nascita;
        // this.thisKid.sperimentazione = this.oldInfo.sperimentazione;
        this.editInfo = false;
    }

    editFoto: boolean;
    newFoto: string;

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
                            this.doRerender();
                        },
                            (err) => {
                                console.log(err);
                                this.editFoto = true;
                            });
                        //this.webService.update(this.selectedSchool);
                        //this.doRerender();
                        this.editFoto = false;
                        // this.syncKidObject();
                    }
                }
            ]
        })
        alert.present();

    }
    onFotoSave() {
        this.webService.uploadDocumentInPromise(this.uploader, this.uploader.queue[0], this.selectedSchool, this.selectedKid).then(() => {
            // this.getImage(this.selectedKid)
            this.doRerender();
            // this.syncKidObject();
        },
            (err) => {
                console.log(err);
                this.editFoto = true;

            });
        //this.webService.add(this.selectedSchool, this.thisKid);

        // this.webService.update(this.selectedSchool);
        //this.doRerender();
        this.editFoto = false;

    }

    onFotoCancel() {
        // this.thisKid.image = this.oldFoto;
        this.editFoto = false;
    }

    // addImage(e) {

    // }

    // handleChange(e) {
    //     console.log(e.target.value);
    // }

    editAllergia: boolean;
    newAllergie: string[];

    onAllergiaEdit() {
        this.newAllergie = [];
        this.editAllergia = true;
        if (this.selectedKid.allergie != null) {
            this.selectedKid.allergie.forEach(x => this.newAllergie.push(x));
        }
    }

    onAllergiaSave() {
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

    onAllergiaCancel() {
        // this.thisKid.allergie = [];
        // this.oldAll.forEach(x => this.thisKid.allergie.push(x));
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

    editService: boolean;

    // newChecked = {};

    onServiceEdit() {
        this.editService = true;

    }

    onServiceSave() {
        this.editService = false;
        let newService = [];
        // if (this.servicesChecked.services!=null){
        //     this.selectedKid.services.forEach(x => newService.push(x));
        // }
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
        //  this.thisKid.services = [];
        // this.oldService.forEach(x => this.thisKid.services.push(x));
    }

    // changeServices() {
    //     console.log('change servicesss')
    //     var x = new Array();
    //     for (var i in this.servicesChecked) {
    //         if (this.servicesChecked[i]) {
    //             let selectedSevice = this.selectedSchool.servizi.find(c => c.servizio && c.servizio.toLowerCase() === i.toLowerCase());
    //             if (selectedSevice != undefined) {
    //                 x.push(selectedSevice);
    //             }
    //         }
    //     }
    //     this.newService = x
    //    // console.log(this.thisKid.services)
    // }

    // editClick() {
    //     this.edit = !this.edit;
    // }

    // syncKidObject() {
    //    // this.selectedKid.copyInto(JSON.parse(JSON.stringify(this.thisKid)));
    //     // Object.assign(this.selectedKid, this.thisKid)
    //     // this.selectedKid.allergie = new Array();
    //     // this.thisKid.allergie.forEach(x => this.selectedKid.allergie.push(x));
    //     // this.selectedKid.deleghe = new Array();
    //     // this.thisKid.deleghe.forEach(x => this.selectedKid.deleghe.push(x));
    //     // this.selectedKid.ritiro = new Array();
    //     // this.thisKid.ritiro.forEach(x => this.selectedKid.ritiro.push(x));
    //     // this.selectedKid.services = new Array();
    //     // this.thisKid.services.forEach(x => this.selectedKid.services.push(x));

    //  // this.webService.update(this.selectedSchool);
    //     this.edit = false;
    // }

    // cancelClick() {
    //     if (this.isNew) {
    //         this.edit = false;
    //         this.goBack();
    //     }
    //     else {
    //       //  Object.assign(this.thisKid, this.selectedKid);
    //         this.edit = !this.edit;
    //     }
    // }

    editP1Info: boolean;
    newParent1: Parent = new Parent('', '', '');

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
        // this.thisKid.parent1.id = this.oldParent1.id;
        // this.thisKid.parent1.name = this.oldParent1.name;
        // this.thisKid.parent1.surname = this.oldParent1.surname;
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
        this.newParent1.emails = this.selectedKid.parent1.emails.slice();
        this.newParent1.phoneNumbers = this.selectedKid.parent1.phoneNumbers.slice();
    }

    onP1ContattiSave() {
        try {
            this.checkEmailAndPhones(this.newParent1)
            this.editP1Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent1 = this.newParent1;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
            }, (err) => {
                this.editP1Info = true;
            });
        } catch (e) {
            this.manageContactException(e);

            // if (e == this.BreakEmailException) {
            //     this.toastWrongEmail = this.toastCtrl.create({
            //         message: 'Formato email non valido',
            //         duration: 1000,
            //         position: 'middle',
            //         dismissOnPageChange: true
            //     });
            //     this.toastWrongEmail.present()

            // } else if (e == this.BreakPhoneException) {
            //     this.toastWrongPhone = this.toastCtrl.create({
            //         message: 'Formato telefono non valido',
            //         duration: 1000,
            //         position: 'middle',
            //         dismissOnPageChange: true

            //     });

            //     this.toastWrongPhone.present()
            // }
        }
    }

    onP1ContattiCancel() {
        this.editP1Contatti = false;
        // this.thisKid.parent1.emails = this.oldParent1.emails.slice();
        // this.thisKid.parent1.phoneNumbers = this.oldParent1.phoneNumbers.slice();
    }

    editP2Info: boolean;
    newParent2: Parent = new Parent('', '', '');

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
        // this.thisKid.parent2.id = this.oldParent2.id;
        // this.thisKid.parent2.name = this.oldParent2.name;
        // this.thisKid.parent2.surname = this.oldParent2.surname;
        this.editP2Info = false;
    }

    editP2Contatti: boolean;

    onP2ContattiEdit() {
        this.editP2Contatti = true;
        this.newParent2.emails = this.selectedKid.parent2.emails.slice();
        this.newParent2.phoneNumbers = this.selectedKid.parent2.phoneNumbers.slice();
    }
    private manageContactException(e) {
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
    onP2ContattiSave() {
        // this.editP2Contatti = false;
        // if (this.checkEmailAndPhones(this.thisKid.parent1)) {
        //     this.webService.add(this.selectedSchool, this.thisKid);
        // } else {
        //     // Toast
        // }
        try {
            this.checkEmailAndPhones(this.newParent2)
            this.editP2Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent2 = this.newParent2;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
            }, (err) => {
                this.editP2Info = true;
            });
        } catch (e) {
            this.manageContactException(e);
        }

    }

    onP2ContattiCancel() {
        this.editP2Contatti = false;
        // this.thisKid.parent2.emails = this.oldParent2.emails.slice();
        // this.thisKid.parent2.phoneNumbers = this.oldParent2.phoneNumbers.slice();
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

    editDelegaInfo: boolean;
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
        //}
        // this.webService.add(this.selectedSchool, this.thisKid);
    }

    onDelegaInfoCancel() {
        this.editDelegaInfo = false;
        this.selectedDelega = null;
        this.isNewD = false;
        // this.oldDelega = [];
        // this.thisKid.deleghe.forEach(x => this.oldDelega.push(x));
    }

    // editDelegaContatti: boolean;

    // onDelegaContattiEdit() {
    //     this.editDelegaContatti = true;
    // }

    // onDelegaContattiSave() {
    //     this.editDelegaContatti = false;
    //     this.webService.add(this.selectedSchool, this.thisKid);
    // }

    // onDelegaContattiCancel() {
    //     this.editDelegaContatti = false;
    // }

    // editDelegaAutor: boolean;

    // onDelegaAutorEdit() {
    //     this.editDelegaAutor = true;
    // }

    // onDelegaAutorSave() {
    //     this.editDelegaAutor = false;
    //     this.webService.add(this.selectedSchool, this.thisKid);
    // }

    // onDelegaAutorCancel() {
    //     this.editDelegaAutor = false;
    // }


    // saveDClick() {
    //     this.isNewD = false;
    //     this.editD = false;
    //     this.edit = false;
    //     this.syncKidObject();
    // }

    // editDClick() {
    //     this.editD = !this.editD;
    // }

    // cancelDClick() {
    //     if (this.isNewD) { this.isNewD = false; this.selectedDelega = undefined }
    //     this.editD = false;
    // }
    getImage(child) {
        var image = this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + child.id + "/" + sessionStorage.getItem('access_token');
        return image;
    }
    // getUploadUrl() {
    //     var image = this.apiUrl + "/consoleweb/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/kid/" + this.thisKid.id + "/picture";
    //     return image;
    // }

    newBus: BusService = new BusService();
    onBusEdit() {
        this.editBus = true;
        this.newBus.enabled=this.selectedKid.bus.enabled;
        this.newBus.stops=this.selectedKid.bus.stops.slice();
        this.newBus.busId=this.selectedKid.bus.busId;
        // stops: Stop[];
        // busId : string;
        // this.newBus = Object.assign({}, this.thisKid.bus);
    }

    onBusSave() {
        this.editBus = false;
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.bus=this.newBus;
        this.webService.add(this.selectedSchool, tmpKid).then(()=> {
            this.selectedKid.copyInto(tmpKid);
        },(err)=>{
            //TODO
            this.editBus=true;
        });
    }

    onBusCancel() {
        this.editBus = false;
        // this.thisKid.bus = this.oldBus;
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
}