import { Time } from './../../../../app/Classes/time';
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
    copiedOrario : Service = new Service('', [], [], false);

    isNew : boolean;
    giaNorm : boolean[]; //segna se c'è già un servizio normale (ce ne può essere solo uno)



    constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
        this.selectedSchool = this.params.get('school') as School;
        this.selectedOrario = this.params.get('orario') as Service;
        this.isNew = this.params.get('isNew') as boolean;
        this.giaNorm = this.params.get('giaNorm') as boolean[];

        Object.assign(this.copiedOrario, this.selectedOrario);
        this.copiedOrario.fasce = [];
        this.selectedOrario.fasce.forEach(x => this.copiedOrario.fasce.push(new Time(x.name, new Date(0, 0, 0, parseInt(x.start.substring(0, 2)), parseInt(x.start.substring(3, 5))),  new Date(0, 0, 0, parseInt(x.end.substring(0, 2)), parseInt(x.end.substring(3, 5))))));
    }

    ngOnInit() {
        
    }

    close() {
        this.webService.update(this.selectedSchool);
        this.navCtrl.pop();
    }

    save() {
        this.copiedOrario.fasce.sort((item1, item2) => item1.start.localeCompare(item2.start));
        Object.assign(this.selectedOrario, this.copiedOrario);

        if(this.isNew) {
            if(this.selectedSchool.servizi.findIndex(x => x.servizio.toLowerCase() == this.selectedOrario.servizio.toLowerCase()) < 0) {
                this.webService.add(this.selectedSchool.id, this.copiedOrario).then(tmp => this.selectedSchool.servizi.push(tmp.servizi[tmp.servizi.length - 1])); //aggiungere case servizio webservice
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

    addFascia() {
        var newFascia = new Time('', new Date(0), new Date(0));
        this.copiedOrario.fasce.push(newFascia);
        this.changeName(this.copiedOrario.fasce[this.copiedOrario.fasce.length - 1].name);
    }

    removeFascia(fascia : Time) {
        this.copiedOrario.fasce.splice(this.copiedOrario.fasce.findIndex(t=>t.name.toLowerCase() === fascia.name.toLowerCase()), 1);
    }

    editFascia(item : Time) {
        let alert = this.alertCtrl.create({
          title: item.name,
          inputs: [
            {
                name: 'da',
                placeholder: 'da',
                type: 'time'
            },
            {
                name: 'a',
                placeholder: 'a',
                type: 'time'
            }
          ]
        });
        alert.present();
    }

    disable : boolean;
    changeName(string : string) {
        if(string == '') this.disable = true;
        else this.disable = false
    }

    blurFascia(fascia : Time) {
        if(fascia.name == '') {
            this.copiedOrario.fasce.splice(this.copiedOrario.fasce.findIndex(t=>t.name.toLowerCase() === fascia.name.toLowerCase()), 1);
            this.disable = false
        }
    }
}