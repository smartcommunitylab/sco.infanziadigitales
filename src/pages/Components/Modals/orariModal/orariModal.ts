import { Service } from './../../../../app/Classes/service';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

@Component({
  selector: 'orari-modal',
  templateUrl: 'orariModal.html',
})

export class OrariModal implements OnInit{
    selectedSchool : School;

    selectedOrario: Service;
    copiedOrario : Service = new Service('', [], false);

    // selectedServiceKids : Kid[] = [];

    isNew : boolean;

    constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
        this.selectedSchool = this.params.get('school') as School;
        this.selectedOrario = this.params.get('orario') as Service;
        this.isNew = this.params.get('isNew') as boolean;

        Object.assign(this.copiedOrario, this.selectedOrario);
    }

    ngOnInit() {
        
    }

    close() {
        this.webService.update(this.selectedSchool);
        this.navCtrl.pop();
    }

    save() {
        Object.assign(this.selectedOrario, this.copiedOrario);

        if(this.isNew) {
            if(this.selectedSchool.servizi.findIndex(x => x.servizio.toLowerCase() == this.selectedOrario.servizio.toLowerCase()) < 0) {
                this.webService.add(this.selectedSchool.id, this.copiedOrario).then(tmp => this.selectedSchool.servizi.push(tmp.servizi[tmp.servizi.length - 1]));
                this.webService.update(this.selectedSchool);
                this.close();
            }
            else {
                let alert = this.alertCtrl.create({
                subTitle: 'Elemento già presente (conflitto di nomi)',
                buttons: ['OK']
                });
                alert.present();
            }
        }
        this.close();
    }
}