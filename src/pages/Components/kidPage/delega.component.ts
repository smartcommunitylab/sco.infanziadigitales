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
                <ion-item>
                    <ion-label>Ruolo</ion-label>
                    <ion-select [(ngModel)]="delega.legame">
                        <ion-option value="Nonn">Nonno/a</ion-option>
                        <ion-option value="Zi">Zio/a</ion-option>
                        <ion-option value="Fratello/Sorella">Fratello/Sorella (maggiorenne)</ion-option>
                        <ion-option value="Altro">Altro</ion-option>
                    </ion-select>
                </ion-item>
            </ion-card-content>
        </ion-card>
    `,
})

export class DelegaPage {
    @Input() delega: Delega;
}
    