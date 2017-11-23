import { WebService } from './../../../services/WebService';
import { AlertController, ToastController } from 'ionic-angular';
import { School } from './../../../app/Classes/school';
import { Bus } from './../../../app/Classes/bus';
import { Component, OnInit, Input } from '@angular/core';

import { CommonService, EditFormObserver } from  './../../../services/common.service';

import {Validators, FormBuilder, FormGroup, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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

    contactForm: FormGroup;
    assenzeForm: FormGroup;
    malattieForm: FormGroup;
    busForm: FormGroup;

    contactFormObserver: EditFormObserver;
    assenzeFormObserver: EditFormObserver;
    malattieFormObserver: EditFormObserver;
    busFormObserver: EditFormObserver;
    
    constructor(private alertCtrl: AlertController, private webService: WebService, private common: CommonService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.contactForm = this.formBuilder.group({
            email: ['', CommonService.emailFieldValidator],
            phone: ['', CommonService.phoneFieldValidator]
        });
        this.assenzeForm = this.formBuilder.group({
            assenza: ['', this.validateAssenze(this)],
            isMalattiaEnabled: ['']
        });
        this.malattieForm = this.formBuilder.group({
            malattia: ['', this.validateMalattie(this)]
        });
        this.busForm = this.formBuilder.group({
            bus: ['', this.validateBuses(this)]
        });

        this.contactFormObserver = { isDirty: () => this.contactForm.dirty };
        this.assenzeFormObserver =  { isDirty: () => this.assenzeForm.dirty || !!this.newAssenza || JSON.stringify(this.newAssenze) != JSON.stringify(this.selectedSchool.assenze)};
        this.malattieFormObserver =  { isDirty: () => this.malattieForm.dirty || !!this.newMalattia || JSON.stringify(this.newMalattie) != JSON.stringify(this.selectedSchool.malattie)};
        this.busFormObserver =  { isDirty: () => {
            let olds = this.selectedSchool.buses.map(bus => bus.busId);
            let news = this.newBuses.map(bus => bus.busId);
            return this.busForm.dirty || !!this.newBus || JSON.stringify(news) != JSON.stringify(olds);
        }};
    }

    isInEdit(): boolean {
        return this.editContatti || this.editAssenze || this.editMalattie || this.editBus;
    }


    onContattiEdit() {
        this.editContatti = true;
        this.newContatti.email = this.selectedSchool.email;
        this.newContatti.phone = this.selectedSchool.phoneNumbers.length > 0 ? this.selectedSchool.phoneNumbers[0] : '';        
        this.common.addEditForm('schoolContacts', this.contactFormObserver);
    }
    
    onContattiSave() {
        this.editContatti = false;
        let schoolCopy = School.copy(this.selectedSchool);
        schoolCopy.email = this.newContatti.email;
        schoolCopy.phoneNumbers = [this.newContatti.phone];
        this.webService.update(schoolCopy).then(() => {
            this.selectedSchool.copyInto(schoolCopy);
            this.common.removeEditForm('schoolContacts');
        }, err => {
            // TODO handle error
            this.editContatti = true;                    
        });
    }

    onContattiCancel() {
        this.editContatti = false;
        this.common.removeEditForm('schoolContacts');        
    }

    onAssenzeEdit() {
        this.newAssenze = [];
        this.newAssenza = '';
        if (this.selectedSchool.assenze) {
            this.selectedSchool.assenze.forEach(x => this.newAssenze.push(x));
        }    
        this.isMalattiaEnabled = this.selectedSchool.malattia;
        this.editAssenze = true;
        this.common.addEditForm('schoolAssenze', this.assenzeFormObserver);
        
    }

    onAssenzeSave() {
        let handler = () => {
            this.editAssenze = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.malattia = this.isMalattiaEnabled;
            schoolCopy.assenze = this.newAssenze;
    
            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
                this.common.removeEditForm('schoolAssenze');
            }, err => {
                // TODO handle error
                this.editAssenze = true;                    
            });    
        }
        this.checkNonSavedValue(this.newAssenza, handler);
    }

    onAssenzeCancel() {
        this.editAssenze = false;
        this.common.removeEditForm('schoolAssenze');
    }

    private validateAssenze(data: any): ValidatorFn {
        return (fc) => {
            if (data.newAssenze && data.newAssenze.findIndex(x => x.toLowerCase() === fc.value.toLowerCase()) >= 0 ||
                fc.value.toLowerCase() == 'malattia') {
                return {'unique':true};
            }
            return null;
        };
    }


    addAssenza(assenza: string) {
        if (assenza !== undefined && assenza !== '' && this.assenzeForm.valid) {
            this.newAssenze.push(assenza);
            this.newAssenza = '';
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
        this.common.addEditForm('schoolMalattie', this.malattieFormObserver);        
    }

    onMalattieSave() {
        let handler = () => {
            this.editMalattie = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.malattie = this.newMalattie;
    
            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
                this.common.removeEditForm('schoolMalattie');
            }, err => {
                // TODO handle error
                this.editMalattie = true;                    
            });    
        }
        this.checkNonSavedValue(this.newMalattia, handler);
    }

    onMalattieCancel() {
        this.editMalattie = false;
        this.common.removeEditForm('schoolMalattie');
    }

    private validateMalattie(data: any): ValidatorFn {
        return (fc) => {
            if (data.newMalattie && data.newMalattie.findIndex(x => x.toLowerCase() === fc.value.toLowerCase()) >= 0) {
                return {'unique':true};
            }
            return null;
        };
    }

    addMalattia(malattia: string) {
        if (malattia !== undefined && malattia.trim() !== '' && this.malattieForm.valid) {
            this.newMalattie.push(malattia);
            this.newMalattia = '';
        }
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
        this.common.addEditForm('schoolBuses', this.busFormObserver);        
    }

    onBusSave() {
        let handler = () => {
            this.editBus = false;
            let schoolCopy = School.copy(this.selectedSchool);
            schoolCopy.buses = this.newBuses;

            this.webService.update(schoolCopy).then(() => {
                this.selectedSchool.copyInto(schoolCopy);
                // remove from kids non-existing buses
                this.selectedSchool.kids.forEach(kid => {
                    if (kid.bus && !this.selectedSchool.buses.some(b => b.busId == kid.bus.busId)) {
                        kid.bus.busId = null;
                    }
                });
                this.common.removeEditForm('schoolBuses');
            }, err => {
                // TODO handle error
                this.editBus = true;                    
            });    
        }
        this.checkNonSavedValue(this.newBus, handler);
    }

    onBusCancel() {
        this.editBus = false;
        this.common.removeEditForm('schoolBuses');
    }


    private validateBuses(data: any): ValidatorFn {
        return (fc) => {
            if (data.newBuses && data.newBuses.findIndex(x => x.busId.toLowerCase() === fc.value.toLowerCase()) >= 0) {
                return {'unique':true};
            }
            return null;
        };
    }
    addBus(bus: string) {
        if (bus !== undefined && bus.trim() !== '' && this.busForm.valid) {
            if (!this.newBuses) {
                this.newBuses = [];
                this.newBuses.push(new Bus(bus));
                this.newBus = '';                
            }
            else {
                this.newBuses.push(new Bus(bus));
                this.newBus = '';                    
            }
        }    
    }

    removeBus(bus: Bus) {
        let hasKids = false;
        if (this.selectedSchool.kids) {
          hasKids = this.selectedSchool.kids.some(kid => kid.bus && kid.bus.busId == bus.busId);
        }
            
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            message: hasKids ? 'Attenzione! Ci sono dei bambini associati a questa linea.' : null,
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