import { Delega } from './../../../app/Classes/delega';
import { AlertController } from 'ionic-angular';
import { Service } from './../../../app/Classes/service';
import { Group } from './../../../app/Classes/group';
import { School } from './../../../app/Classes/school';
import { Kid } from './../../../app/Classes/kid';
import { WebService } from './../../../app/WebService';
import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'delega',
    template: `
        <ion-card>
            <ion-card-header>
                {{delega.name}} {{delega.surname}}
            </ion-card-header>
            <ion-card-content>
            <ion-grid>
                <ion-row>
                    <ion-col col-4>
                        <ion-grid inset>
                            <ion-row margin-bottom>
                                <ion-col col-2>
                                    Ruolo
                                </ion-col>
                                <ion-col col-10>
                                    <ion-select [(ngModel)]="delega.legame" interface='popover' *ngIf="edit">
                                        <ion-option value="Nonno/a">Nonno/a</ion-option>
                                        <ion-option value="Zio/a">Zio/a</ion-option>
                                        <ion-option value="Fratello/Sorella">Fratello/Sorella (maggiorenne)</ion-option>
                                        <ion-option value="Altro">Altro</ion-option>
                                    </ion-select>
                                    <span *ngIf="!edit" style="padding-left: 8px;">{{delega.legame}}</span>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col col-12>
                        <ion-card>
                            <ion-card-header>
                                Informazioni di base
                            </ion-card-header>
                            <ion-card-content margin-top>
                                <ion-grid inset>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            C.F. (ID):
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.id" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Nome:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.name" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Cognome:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.surname" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                        <ion-card>
                            <ion-card-header>
                                Contatti
                            </ion-card-header>
                            <ion-card-content margin-top>
                                <ion-grid inset>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Telefono:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.telephone" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Cellulare:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.cellphone" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Indirizzo email:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-input [(ngModel)]="delega.email" [disabled]='!edit' no-margin></ion-input>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                        <ion-card>
                            <ion-card-header>
                                Autorizzazione
                            </ion-card-header>
                            <ion-card-content margin-top>
                                <ion-grid inset>
                                    <ion-row margin-bottom>
                                        <ion-col col-2>
                                            Scadenza autorizzazione:
                                        </ion-col>
                                        <ion-col col-10>
                                            <ion-datetime displayFormat="DD/MM/YYYY" [(ngModel)]="delega.scadenza" *ngIf='edit' no-margin></ion-datetime >
                                            <span *ngIf="!edit" style="padding-left: 8px;">{{delega.scadenza}}</span>
                                        </ion-col>
                                    </ion-row>
                                    <ion-row margin-bottom>
                                        <ion-col col-12>
                                            <span *ngIf='delega.maggiorenne && !edit'>La persona dichiara di essere maggiorenne</span>
                                            <ion-item *ngIf='edit'>
                                                <ion-label>Dichiara di essere maggiorenne</ion-label>
                                                <ion-checkbox [(ngModel)]="delega.maggiorenne"></ion-checkbox>
                                            </ion-item>
                                        </ion-col>
                                    </ion-row>
                                </ion-grid>
                            </ion-card-content>
                        </ion-card>
                    </ion-col>
                </ion-row>
            </ion-grid>
            </ion-card-content>
        </ion-card>
    `,
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

export class DelegaPage {
    @Input() delega: Delega;
    @Input() edit : boolean;
}
    