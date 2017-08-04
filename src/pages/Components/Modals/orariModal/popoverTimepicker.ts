import { Time } from './../../../../app/Classes/time';
import { NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component ({
    template: `
        <ion-list radio-group>
            <ion-row>
                <ion-col>
                    <button ion-item detail-none class='arrowBut' (click)="increse('o')"><ion-icon name="arrow-dropup-circle"></ion-icon></button>
                </ion-col> 
                <ion-col>
                    <button ion-item detail-none class='arrowBut' (click)="increse('m')"><ion-icon name="arrow-dropup-circle"></ion-icon></button>
                </ion-col> 
            </ion-row>
            <ion-row>
                <ion-col text-center>
                    <ion-input type='number' class='inputTime' [(ngModel)]='ore' (ionChange)='change()'></ion-input>
                </ion-col> 
                <ion-col text-center>
                    <ion-input type='number' class='inputTime' [(ngModel)]='minuti' (ionChange)='change()'></ion-input>
                </ion-col> 
            </ion-row>
            <ion-row>
                <ion-col>
                    <button ion-item detail-none class='arrowBut' (click)="decrease('o')"><ion-icon name="arrow-dropdown-circle"></ion-icon></button>
                </ion-col> 
                <ion-col>
                    <button ion-item detail-none class='arrowBut' (click)="decrease('m')"><ion-icon name="arrow-dropdown-circle"></ion-icon></button>
                </ion-col> 
            </ion-row>
        </ion-list>
        `,
    styles: [
        `
            .arrowBut {
                text-align: center;
            }
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .inputTime {
                border: solid black 1px;
            }
            .text-input {
                text-align: center;
                font-size: 20px;
                margin: 7px auto;
            }
        `
    ]
})

export class PopoverTimepicker {
    orario : Time;
    ctrl : string;
    ore:string;
    minuti:string;
    constructor(public viewCtrl: ViewController, public params : NavParams) {
        this.orario = this.params.get('oggetto');
        this.ctrl = this.params.get('ctrl');
        if(this.ctrl === "s") {
            this.ore = this.orario.start.substring(0,2);
            this.minuti = this.orario.start.substring(3,5);
        }
        else {
            this.ore = this.orario.end.substring(0,2);
            this.minuti = this.orario.end.substring(3,5);
        }
    }

    increse(ctrl: string) {
        if(ctrl === 'o') {
            if(this.ore < '24')
                this.ore = (new Date(0, 0, 0, parseInt(this.ore) + 1).toLocaleTimeString().substring(0, 2));
        }
        else {
            if(this.minuti < '55')
                this.minuti = (new Date(0, 0, 0, 0, parseInt(this.minuti) + 5).toLocaleTimeString().substring(3, 5));
            else {
                this.minuti = (new Date(0, 0, 0, 0, 59)).toLocaleTimeString().substring(3, 5);
            }
        }
        this.change();
    }

    decrease(ctrl: string) {
        if(ctrl === 'o') {
            if(this.ore > '0')
                this.ore = (new Date(0, 0, 0, parseInt(this.ore) - 1).toLocaleTimeString().substring(0, 2));
        }
        else {
            if(this.minuti > '0')
                this.minuti = (new Date(0, 0, 0, 0, parseInt(this.minuti) - 1).toLocaleTimeString().substring(3, 5));
        }
        this.change();
    }

    change() {
        if(this.ctrl === "s") {
            this.orario.start = new Date(0, 0, 0, parseInt(this.ore), parseInt(this.minuti)).toLocaleTimeString().substring(0, 5);
        }
        else {
            this.orario.end = new Date(0, 0, 0, parseInt(this.ore), parseInt(this.minuti)).toLocaleTimeString().substring(0, 5);
        }
    }
}