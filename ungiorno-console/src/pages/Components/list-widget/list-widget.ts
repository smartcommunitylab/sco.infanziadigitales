import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';

@Component({
    selector: 'list-widget',
    templateUrl: './list-widget.html',
    styles: [`
    ion-grid {
        font-size: 17px !important;
         padding-left: 16px !important;
    }
    ion-card-header {
        font-size: 20px !important;
        padding-top: 8px !important;
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

export class ListWidget {
    @Input() items: string[];
    @Input() editMode: boolean = false;
    @Input() label: string;
    @Input() type?: string;
    @Input() validator: (val: string, toastCtrl: ToastController) => boolean;

    newItem: string = "";
    constructor(private alertCtrl:AlertController, private toastCtrl: ToastController) { }

    addItem() {
        if (this.newItem.trim().length == 0) {
            return;
        }
        if (this.validator && !this.validator(this.newItem.trim(), this.toastCtrl)) return;

        if (!this.items) {
            this.items = [];
        }
        this.items.push(this.newItem.trim());
        this.newItem = "";
    }

    removeItem(item) {
        let alert = this.alertCtrl.create({
            subTitle: 'Conferma eliminazione',
            buttons: [
                {
                    text: "Annulla"
                },
                {
                    text: 'OK',
                    handler: () => {
                        this.items && this.items.forEach((i, idx) => {
                            if (i === item) {
                                this.items.splice(idx, 1);
                            }
                        });
                    }
                }
            ]
        })
        alert.present();

    }
}