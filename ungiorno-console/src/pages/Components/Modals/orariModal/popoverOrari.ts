import { ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component ({
    template: `
        <ion-list class="popover-page">
            <ion-item>
                  <ion-icon name="alert" style='margin-left: 2px; margin-right: 5px' color='magenta1'></ion-icon> Le fasce orarie non si possono sovrapporre
            </ion-item>
        </ion-list>    
        `
})

export class PopoverPage {
    constructor(public viewCtrl: ViewController) {}
}