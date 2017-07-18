import { Delega } from './../../../app/Classes/delega';
import { AlertController } from 'ionic-angular';
import { Service } from './../../../app/Classes/service';
import { Group } from './../../../app/Classes/group';
import { School } from './../../../app/Classes/school';
import { Kid } from './../../../app/Classes/kid';
import { WebService } from './../../../app/WebService';
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
    selectedKid : Kid;
    selectedSchool : School
    selectedKidGroups : Group[];
    kidSettings:string = 'info';
    edit:boolean = false;

    newAllergia : string;
    selectedDelega :Delega;

    thisKid : Kid = new Kid('', '', '');
    
    constructor(
        private webService : WebService,
        private route : ActivatedRoute,
        private location : Location,
        private alertCtrl : AlertController
    ) { }

    ngOnInit(): void {    
        this.route.paramMap.switchMap((params: ParamMap) => this.webService.getKid(params.get('schoolId'), params.get('kidId'))).subscribe(kid => {this.selectedKid = kid; Object.assign(this.thisKid, kid)});
        this.route.paramMap.switchMap((params: ParamMap) => this.webService.getSchool(params.get('schoolId'))).subscribe(school => {
            this.selectedSchool = school; 
            this.selectedKidGroups = this.selectedSchool.groups.filter(x => x.kids.findIndex(d=>d.id === this.selectedKid.id) >= 0);
        });
    }

    goBack() {
        this.location.back();
    }

    addAllergia(all : string) {
        if(this.thisKid.allergie.findIndex(x=>x.toLowerCase() === all.toLowerCase()) < 0)
            this.thisKid.allergie.push(all);
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
                checked: this.thisKid.services.findIndex(x => x.servizio === element.servizio) >= 0
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

    onSelectDelega(delega: Delega) {
        this.selectedDelega = delega;
    }

    editClick() {
        this.edit = !this.edit;
    }

    saveClick() {
        Object.assign(this.selectedKid, this.thisKid);
        Object.assign(this.selectedSchool.kids.find(x => x.id === this.selectedKid.id), this.selectedKid);
        this.webService.update(this.selectedSchool);
        this.webService.getSchool(this.selectedSchool.id).then(x => console.log(x));
        this.webService.getData().then(x => console.log(x))
        this.edit = !this.edit;
        this.goBack();
    }

    cancelClick() {
        Object.assign(this.thisKid, this.selectedKid);
        this.edit = !this.edit;
    }
}