import { StatusBar } from '@ionic-native/status-bar';
import { Delega } from './../../../../../app/Classes/delega';
import { Service } from './../../../../../app/Classes/service';
import { Group } from './../../../../../app/Classes/group';
import { School } from './../../../../../app/Classes/school';
import { Kid } from './../../../../../app/Classes/kid';
import { WebService } from './../../../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'delega',
    templateUrl: 'delega-component.html',
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

export class DelegaPage implements OnInit{
    @Input() delega: Delega;
    @Input() edit : boolean;
    @Input() selectedSchool : School;

    isNew : boolean;

    ngOnInit() {
        this.isNew = this.delega.id === '';
    }
}
    