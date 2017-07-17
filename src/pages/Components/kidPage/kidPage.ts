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
            padding-left: 8px;
        }
    `]
})

export class KidPage implements OnInit{ 
    selectedKid : Kid;
    selectedSchool : School
    selectedKidGroups : Group[];
    kidSettings:string = 'info';
    nascita : string;
    edit:boolean = false;
    
    constructor(
        private webService : WebService,
        private route : ActivatedRoute,
        private location : Location
    ) { }

    ngOnInit(): void {    
        this.route.paramMap.switchMap((params: ParamMap) => this.webService.getKid(params.get('schoolId'), params.get('kidId'))).subscribe(kid => this.selectedKid = kid);
        this.route.paramMap.switchMap((params: ParamMap) => this.webService.getSchool(params.get('schoolId'))).subscribe(school => {
            this.selectedSchool = school; 
            this.selectedKidGroups = this.selectedSchool.groups.filter(x => 
                x.kids.findIndex(d=>d.id === this.selectedKid.id) >= 0);
                this.nascita = new Date(this.selectedKid.nascita).toLocaleString();
                });   
    }

    goBack() {
        this.location.back();
    }

    editClick() {
        this.edit = !this.edit;
        this.nascita = new Date(this.selectedKid.nascita).toLocaleString();
    }
}