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
import { CommonService, EditFormObserver } from  './../../../../services/common.service';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {Validators, FormBuilder, FormGroup, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
        ion-grid .row {
            min-height: 37px;
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
    @Input() edit: boolean = false;

    @Output() kidUpdated = new EventEmitter();

    //thisKid: Kid = new Kid('', '', '');

    selectedKidGroups: Group[];

    kidSettings: string = 'info';
    kidSettingsSeg: string = 'info';

    image = "";
    filePreviewPath: SafeUrl;
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
    newParent1: any = {};
    editP1Contatti: boolean;
    @ViewChild('p1Phones') p1Phones;
    @ViewChild('p1Emails') p1Emails;
    // data for 2nd parent
    editP2Info: boolean;
    newParent2: any = {};
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

    emailValidator = CommonService.emailFieldValidator;
    phoneValidator = CommonService.phoneFieldValidator;
    
    infoForm : FormGroup;    
    p1ContattiForm: FormGroup;
    p2ContattiForm: FormGroup;
    delegaForm: FormGroup;

    infoObserver: EditFormObserver;
    fotoObserver: EditFormObserver;
    allergiaObserver: EditFormObserver;
    orariObserver: EditFormObserver;
    busObserver: EditFormObserver;
    p1InfoObserver: EditFormObserver;
    p1ContattiObserver: EditFormObserver;
    p2InfoObserver: EditFormObserver;
    p2ContattiObserver: EditFormObserver;
    delegaObserver: EditFormObserver;
    
    constructor(
        private webService: WebService,
        private configService: ConfigService,
        private commonService: CommonService,
        private alertCtrl: AlertController,
        private http: Http,
        private cdRef: ChangeDetectorRef,
        private toastCtrl: ToastController,
        private formBuilder: FormBuilder,
        private sanitizer: DomSanitizer
    ) {
        this.apiUrl = this.configService.getConfig('apiUrl');

    }

    ngOnInit(): void {
        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);
        this.isNew = this.selectedKid.id == '';
        this.editInfo = this.isNew;
        this.initServices();
        this.image=this.getImage();

        this.infoForm = this.formBuilder.group({
            id: [{value: '', disabled: !this.isNew}, Validators.compose([Validators.required, this.validateId(this)])],
            name: ['', Validators.required],
            surname: ['', Validators.required],
            gender: [''],
            nascita: [''],
            sperimentazione: [''],
        });

        this.p1ContattiForm = this.formBuilder.group({
            email: ['', this.emailValidator]
        });
        this.p2ContattiForm = this.formBuilder.group({
            email: ['', this.emailValidator]
        });

        // change observers
        this.infoObserver = { isDirty: () => {
            return this.infoForm.dirty;
        }};
        this.fotoObserver = { isDirty: () => this.filePreviewPath != null };
        this.allergiaObserver  = { isDirty: () => {
            if (this.newAllergia) return true;
            return JSON.stringify(this.newAllergie) != JSON.stringify(this.selectedKid.allergie) 
        }};
        this.orariObserver  = { isDirty: () => {
            let newService = [];
            this.selectedSchool.servizi.forEach(servizio => {
                if (this.servicesChecked[servizio.servizio]) {
                    newService.push(servizio);
                }
            });
            newService.sort();
            let oldService = this.selectedKid.services? this.selectedKid.services.slice() : [];
            oldService.sort;
            return JSON.stringify(newService) != JSON.stringify(oldService);
        }};
        this.busObserver = { isDirty: () => {
            if (this.newStop) return true;
            if (!this.newBus.enabled && (!this.selectedKid.bus || !this.selectedKid.bus.enabled)) return false;
            return JSON.stringify(this.newBus) != JSON.stringify(this.selectedKid.bus) 

        }};
        this.p1InfoObserver = { isDirty: () => this.newParent1.name != this.selectedKid.parent1.name || this.newParent1.surname != this.selectedKid.parent1.surname || this.newParent1.id != this.selectedKid.parent1.id};
        this.p2InfoObserver = { isDirty: () => this.newParent2.name != this.selectedKid.parent2.name || this.newParent2.surname != this.selectedKid.parent2.surname || this.newParent2.id != this.selectedKid.parent2.id};
        this.p1ContattiObserver = { isDirty: () => {
            if (this.p1Phones.newItem) return true;
            if (JSON.stringify([this.newParent1.email]) != JSON.stringify(this.selectedKid.parent1.emails)) return true;
            if (JSON.stringify([this.newParent1.phoneNumbers]) != JSON.stringify(this.selectedKid.parent1.phoneNumbers)) return true;
        }};
        this.p2ContattiObserver = { isDirty: () => {
            if (this.p2Phones.newItem) return true;
            if (JSON.stringify([this.newParent2.email]) != JSON.stringify(this.selectedKid.parent2.emails)) return true;
            if (JSON.stringify([this.newParent2.phoneNumbers]) != JSON.stringify(this.selectedKid.parent2.phoneNumbers)) return true;
        }};
        
        this.delegaObserver = { isDirty: () => this.delegaForm.dirty };
        
        // infoObserver: EditFormObserver;
        // fotoObserver: EditFormObserver;
        // allergiaObserver: EditFormObserver;
        // orariObserver: EditFormObserver;
        // busObserver: EditFormObserver;
        // p1InfoObserver: EditFormObserver;
        // p1ContattiObserver: EditFormObserver;
        // p2InfoObserver: EditFormObserver;
        // p2ContattiObserver: EditFormObserver;
        // delegaObserver: EditFormObserver;
    
        if (this.isNew) {
            this.commonService.addEditForm('kidInfo',this.infoObserver );            
        }

        this.uploader.onAfterAddingFile = (fileItem) => {
            this.filePreviewPath  = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(fileItem._file)));
          }
    }

    private validateId(data: any): ValidatorFn {
        return (fc) => {
            if (data.isNew) {
                if (data.selectedSchool.kids.findIndex(x => x.id.toLowerCase() === data.newInfo.id.toLowerCase()) >= 0) {
                    return {'unique':true};
                }
                return null;
            }
        };
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
        if (!this.commonService.hasChangedForm()) {
            this.kidUpdated.emit(this.selectedKid);
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
                        this.kidUpdated.emit(this.selectedKid);
                        this.commonService.clearChanges();
                    }
                }
            ]
        })
        alert.present();
        // }
    }

    onSegmentChange(event) {
        if (this.commonService.hasChangedForm()) {
          let alert = this.alertCtrl.create({
            subTitle: 'Eventuali modifiche non salvate verrano perse. Confermi?',
            buttons: [
                {
                    text: "Annulla",
                    handler: () => {
                      this.kidSettingsSeg = this.kidSettings;
                    }
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.clearChanges();
                        this.kidSettings = this.kidSettingsSeg;
                    }
                }
            ]
          })
          alert.present();
        } else {
          this.kidSettings = this.kidSettingsSeg;
        }    
    }

    clearChanges() {
        if (this.editInfo) this.onInfoCancel();
        if (this.editFoto) this.onFotoCancel();
        if (this.editAllergia) this.onAllergiaCancel();
        if (this.editService) this.onServiceCancel();
        if (this.editBus) this.onBusCancel();
        if (this.editP1Info) this.onP1InfoCancel();
        if (this.editP2Info) this.onP2InfoCancel();
        if (this.editP1Contatti) this.onP1ContattiCancel();
        if (this.editP2Contatti) this.onP2ContattiCancel();
        if (this.editDelegaInfo) this.onDelegaInfoCancel();
        this.commonService.clearChanges();
    }

    onInfoEdit() {
        this.newInfo.id = this.selectedKid.id;
        this.newInfo.name = this.selectedKid.name;
        this.newInfo.surname = this.selectedKid.surname;
        this.newInfo.nascita = this.selectedKid.nascita;
        this.newInfo.gender = this.selectedKid.gender;
        this.newInfo.nascitaStr = this.selectedKid.nascitaStr;
        this.newInfo.sperimentazione = this.selectedKid.sperimentazione;

        this.editInfo = true;
        this.commonService.addEditForm('kidInfo',this.infoObserver );
    }

    onInfoSave() {
        this.editInfo = false;
        // if (this.isNew) {
        //     if (this.selectedSchool.kids.findIndex(x => x.id.toLowerCase() === this.newInfo.id.toLowerCase()) >= 0) {
        //         let alert = this.alertCtrl.create({
        //             subTitle: 'Elemento già presente',
        //             buttons: [
        //                 {
        //                     text: 'OK'
        //                 }
        //             ]
        //         });
        //         alert.present();
        //         return;
        //     }
        // }

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
        // if (this.isNew) {
        //     tmpKid.services.push(this.selectedSchool.servizi.find(x => x.normale));
        // }
        console.log(this.selectedKid.constructor.name)

        this.webService.addKid(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
            if (this.isNew) {
                this.selectedSchool.kids.push(this.selectedKid);
            }
            this.isNew = false;
            this.commonService.removeEditForm('kidInfo');            
            //this.syncKidObject();
        }, (err) => {
            //TODO
            this.editInfo = true;

        });

    }

    onInfoCancel() {
        this.commonService.removeEditForm('kidInfo');                    
        this.editInfo = false;
        if (this.isNew) {
            this.goBack();
        }
    }

    onFotoEdit() {
        this.editFoto = true;
        this.newFoto = this.selectedKid.image;
        this.commonService.addEditForm('kidFoto', this.fotoObserver);            
        
    }

    onConfirmKid() {
        let alert = this.alertCtrl.create({
          subTitle: 'Confermi l\'aggiornamento dei dati? Attenzione: questo cambiamento di stato non è reversibile',
          buttons: [
            {
              text: "Annulla"
            },
            {
              text: 'OK',
              handler: () => {
                this.webService.approveKid(this.selectedSchool, this.selectedKid.id).then(() => {
                    this.selectedKid.dataState = 'updated';
                }, err => {
                  // TODO handle error
                });
              }
            }
          ]
        })
        alert.present();
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
                            this.filePreviewPath = null;
                            this.commonService.removeEditForm('kidFoto');            
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
        this.webService.uploadDocumentInPromise(this.uploader, this.uploader.queue[this.uploader.queue.length-1], this.selectedSchool, this.selectedKid).then(() => {
            // this.doRerender();
            this.image=this.getImage();
            this.commonService.removeEditForm('kidFoto');    
            this.filePreviewPath = null;                    
        },
            (err) => {
                console.log(err);
                this.editFoto = true;

            });
        this.editFoto = false;

    }

    onFotoCancel() {
        this.editFoto = false;
        this.filePreviewPath = null;
       
        this.commonService.removeEditForm('kidFoto');            
    }

    onAllergiaEdit() {
        this.newAllergie = [];
        this.newAllergia = null;
        this.editAllergia = true;
        if (this.selectedKid.allergie != null) {
            this.selectedKid.allergie.forEach(x => this.newAllergie.push(x));
        }
        this.commonService.addEditForm('kidAllergie', this.allergiaObserver);                    
    }

    onAllergiaSave() {
        let handler = () => {
            this.editAllergia = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.allergie = this.newAllergie;
            this.webService.add(this.selectedSchool, tmpKid).then(
                () => {
                    this.selectedKid.copyInto(tmpKid);
                    this.commonService.removeEditForm('kidAllergie');            
                }, (err) => {
                    this.editAllergia = true;
                });
        }
        this.checkNonSavedValue(this.newAllergia, handler);

    }

    onAllergiaCancel() {
        this.editAllergia = false;
        this.newAllergia = null;
        this.commonService.removeEditForm('kidAllergie');            
    }

    addAllergia(all: string) {
        if (all)
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
        this.commonService.addEditForm('kidOrari', this.orariObserver);            
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
            this.commonService.removeEditForm('kidOrari');            
        }, (err) => {
            //TODO
            this.editService = true;
        })
    }

    onServiceCancel() {
        this.editService = false;
        this.initServices();
        this.commonService.removeEditForm('kidOrari');                    
    }

    onP1InfoEdit() {
        this.newParent1.id = this.selectedKid.parent1.id;
        this.newParent1.name = this.selectedKid.parent1.name;
        this.newParent1.surname = this.selectedKid.parent1.surname;
        this.editP1Info = true;
        this.commonService.addEditForm('kidP1Info', this.p1InfoObserver);            
    }

    onP1InfoSave() {
        this.editP1Info = false;
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.parent1.id = this.newParent1.id;
        tmpKid.parent1.name = this.newParent1.name;
        tmpKid.parent1.surname = this.newParent1.surname;
        this.webService.add(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
            this.commonService.removeEditForm('kidP1Info');            
        }, (err) => {
            this.editP1Info = true;
        })
    }

    onP1InfoCancel() {
        this.commonService.removeEditForm('kidP1Info');                    
        this.editP1Info = false;
    }

    onP1ContattiEdit() {
        this.editP1Contatti = true;
        this.newParent1.email = this.selectedKid.parent1.emails.length > 0 ? this.selectedKid.parent1.emails[0] : '';     
        this.newParent1.phoneNumbers = this.selectedKid.parent1.phoneNumbers.slice();
        this.commonService.addEditForm('kidP1Contatti', this.p1ContattiObserver);            
    }

    onP1ContattiSave() {
        let handler = () => {
            this.editP1Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent1.emails = this.newParent1.email ? [this.newParent1.email] : [];
            tmpKid.parent1.phoneNumbers = this.newParent1.phoneNumbers;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
                this.commonService.removeEditForm('kidP1Contatti');                    
            }, (err) => {
                this.editP1Info = true;
            });    
        }
        this.checkNonSavedValue(this.p1Phones.newItem, handler);
    }

    onP1ContattiCancel() {
        this.editP1Contatti = false;
        this.commonService.removeEditForm('kidP1Contatti');                    
    }

    onP2InfoEdit() {
        this.newParent2.id = this.selectedKid.parent2.id;
        this.newParent2.name = this.selectedKid.parent2.name;
        this.newParent2.surname = this.selectedKid.parent2.surname;
        this.editP2Info = true;
        this.commonService.addEditForm('kidP2Info', this.p2InfoObserver);            
    }

    onP2InfoSave() {
        this.editP2Info = false;
        let tmpKid = Kid.copy(this.selectedKid);
        tmpKid.parent2.id = this.newParent2.id;
        tmpKid.parent2.name = this.newParent2.name;
        tmpKid.parent2.surname = this.newParent2.surname;
        this.webService.add(this.selectedSchool, tmpKid).then(() => {
            this.selectedKid.copyInto(tmpKid);
            this.commonService.removeEditForm('kidP2Info');                    
        }, (err) => {
            this.editP2Info = true;
        })
    }

    onP2InfoCancel() {
        this.editP2Info = false;
        this.commonService.removeEditForm('kidP2Info');                            
    }

    onP2ContattiEdit() {
        this.editP2Contatti = true;
        this.newParent2.email = this.selectedKid.parent2.emails.length > 0 ? this.selectedKid.parent2.emails[0] : ''; 
        this.newParent2.phoneNumbers = this.selectedKid.parent2.phoneNumbers.slice();
        this.commonService.addEditForm('kidP2Contatti', this.p2ContattiObserver);            
    }

    onP2ContattiSave() {
        let handler = () => {
            this.editP2Contatti = false;
            let tmpKid = Kid.copy(this.selectedKid);
            tmpKid.parent2.emails = this.newParent2.email ? [this.newParent2.email] : [];
            tmpKid.parent2.phoneNumbers = this.newParent2.phoneNumbers;
            this.webService.add(this.selectedSchool, tmpKid).then(() => {
                this.selectedKid.copyInto(tmpKid);
                this.commonService.removeEditForm('kidP2Contatti');                    
            }, (err) => {
                this.editP1Info = true;
            });    
        }
        this.checkNonSavedValue(this.p2Phones.newItem, handler);
    }

    onP2ContattiCancel() {
        this.editP2Contatti = false;
        this.commonService.removeEditForm('kidP2Contatti');                            
    }

    addDelega() {
        this.isNewD = true;
        this.selectedDelega = new Delega('', '', '');
        this.editD = true;
        this.editDelegaInfo = true;
        this.delegaForm = this.formBuilder.group({
            name: ['', Validators.required],
            surname: ['', Validators.required],
            legame: ['', Validators.required]
        });
        this.commonService.addEditForm('kidDelega', this.delegaObserver);
        
    }

    onSelectDelega(delega: Delega) {
        this.editDelegaInfo = false;
        this.selectedDelega = new Delega(delega.id,delega.name,delega.surname,null,null,delega.legame);
        this.delegaForm = this.formBuilder.group({
            name: [delega.name, Validators.required],
            surname: [delega.surname, Validators.required],
            legame: [delega.legame, Validators.required]
        });

    }

    validId(form: FormGroup) {
        if (this.selectedKid && this.selectedKid.deleghe && this.selectedDelega && this.findDelega(this.selectedKid.deleghe, this.selectedDelega)) {
            return false;
        }
        return true;
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
        this.commonService.addEditForm('kidDelega', this.delegaObserver );
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
                        this.commonService.removeEditForm('kidDelega' );
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
        this.commonService.removeEditForm('kidDelega' );
        
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
        this.commonService.addEditForm('kidBus',this.busObserver );        
    }

    onBusSave() {
        let handler = () => {
            this.editBus = false;
            let tmpKid = Kid.copy(this.selectedKid);
            if (!this.newBus.enabled) {
                this.newBus.stops = [];
                this.newBus.busId = null;                
            }
            tmpKid.bus = this.newBus;
            this.webService.add(this.selectedSchool, tmpKid).then(()=> {
                this.selectedKid.copyInto(tmpKid);
                this.commonService.removeEditForm('kidBus' );
            },(err)=>{
                //TODO
                this.editBus=true;
            });
        }
        this.checkNonSavedValue(this.newStop, handler);
    }

    onBusCancel() {
        this.editBus = false;
        this.commonService.removeEditForm('kidBus' );
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