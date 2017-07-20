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

    constructor(
        private webService : WebService,
        private alertCtrl : AlertController
    ) { }

    ngOnInit(): void {    
        Object.assign(this.thisKid, this.selectedKid)
        this.thisKid.allergie = new Array();
        this.selectedKid.allergie.forEach(x => this.thisKid.allergie.push(x));
        this.thisKid.deleghe = new Array();
        this.selectedKid.deleghe.forEach(x => this.thisKid.deleghe.push(x));
        this.thisKid.ritiro = new Array();
        this.selectedKid.ritiro.forEach(x => this.thisKid.ritiro.push(x));
        this.thisKid.services = new Array();
        this.selectedKid.services.forEach(x => this.thisKid.services.push(x));

        this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d => d.toLowerCase() === this.selectedKid.id.toLowerCase()) >= 0);

        this.isNew = this.thisKid.id == ''; 
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

    changeServices() {
        let alert = this.alertCtrl.create();
        alert.setTitle('Aggiungi servizi');
        
        this.selectedSchool.servizi.forEach(element => {
            alert.addInput({
                type: 'checkbox',
                label: element.servizio,
                value: JSON.stringify(element),
                checked: this.thisKid.services.findIndex(x => x.servizio.toLowerCase() === element.servizio.toLowerCase()) >= 0
            })
        });

        alert.addButton('Annulla');
        alert.addButton({
        text: 'OK',
        handler: data => {
            var x = new Array();
            data.forEach(element => {
            x.push(JSON.parse(element) as Kid)
            });
            this.thisKid.services = x
        }
        })
        alert.present();
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
                this.selectedSchool.kids.push(this.selectedKid);              
            }
        }
        this.webService.update(this.selectedSchool);
        this.edit = !this.edit;
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

    addDelega() {
        if(!this.isNewD) {
            this.isNewD = true;
            this.selectedDelega = new Delega('', '' ,'');
            this.editD = true;
        }
    }

    onSelectDelega(delega: Delega) {
        this.selectedDelega = delega;
    }

    saveDClick() {
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
        this.selectedDelega = undefined;
        this.isNewD = false;
        this.editD = false;
        this.saveClick();
    }

    editDClick() {
        this.editD = !this.editD;
    }

    cancelDClick() {
        this.selectedDelega = undefined;
        this.isNewD = false;
        this.editD = false;
    }
}