import { PopoverTimepicker } from './popoverTimepicker';
import { PopoverPage } from './popoverOrari';
import { Time } from './../../../../app/Classes/time';
import { Service } from './../../../../app/Classes/service';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from '../../../../app/Classes/school';
import { WebService } from '../../../../app/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController, PopoverController, ViewController } from "ionic-angular";


@Component({
  selector: 'orari-modal',
  templateUrl: 'orariModal.html',
  styles: [
      `
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        ion-card-header {
            font-size: 20px !important;
            background-color: rgba(152,186,60, .4);
        }
      `
  ]
})

export class OrariModal implements OnInit{
    selectedSchool : School;

    selectedOrario: Service;
    copiedOrario : Service = new Service('', [], [], false);

    isNew : boolean;
    giaNorm : boolean[]; //segna se c'è già un servizio normale (ce ne può essere solo uno)

    late: string;
    early: string;

    sovrapp:boolean;

    constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController, public popoverCtrl:PopoverController) {
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
        var newFascia = new Time('', new Date(0, 0, 0, 0, 1), new Date(0, 0, 0, 23, 59));
        this.copiedOrario.fasce.push(newFascia);
        this.changeName(this.copiedOrario.fasce[this.copiedOrario.fasce.length - 1].name);
    }

    removeFascia(fascia : Time) {
        this.copiedOrario.fasce.splice(this.copiedOrario.fasce.findIndex(t=>t.name.toLowerCase() === fascia.name.toLowerCase()), 1);
        this.disable = this.copiedOrario.fasce.findIndex(t=>t.name.toLowerCase() === '') >= 0;
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
        this.copiedOrario.fasce.sort((item1, item2) => item1.start.localeCompare(item2.start));
    }

    changeFascia(fascia : Time) {
        this.copiedOrario.fasce.sort((item1, item2) => item1.start.localeCompare(item2.start));
        if(this.copiedOrario.fasce.length > 1)
            for(var i = 1; i < this.copiedOrario.fasce.length; i++) {
                if(this.isBetween(this.copiedOrario.fasce[i].name, this.copiedOrario.fasce[i].start, this.copiedOrario.fasce[i-1].start, this.copiedOrario.fasce[i-1].end, this.copiedOrario.fasce[i-1].name, null) || this.isBetweenSchool(fascia))  {
                    this.sovrapp = true; return;
                }
                else this.sovrapp = false;
            }
        else
            this.sovrapp = this.isBetweenSchool(fascia);
    }

    isBetween (dateName:string, date:string, start:string, end: string, name:string, dateF:string) {
        if(dateF === null) {
            return dateName !== name && (date.localeCompare(start) > 0 && date.localeCompare(end) < 0)
        }
        else {
            return dateName !== name && 
            ((date.localeCompare(start) > 0 && date.localeCompare(end) < 0) || //inizio interno ad una fascia
            (dateF.localeCompare(start) > 0 && dateF.localeCompare(end) < 0) ||  //fine interna a una fascia
            (date.localeCompare(start) <= 0 && dateF.localeCompare(end) >= 0) ||  //inizia prima di o assieme a una fascia e finisce dopo o assieme
            (date.localeCompare(dateF) >= 0))
        } 
    }

    isBetweenSchool (fascia : Time) {
        var ret;
        for(var element of this.selectedSchool.servizi) {
            for(var i = 0; i < element.fasce.length; i++) {
                ret = this.isBetween(fascia.name, fascia.start, element.fasce[i].start, element.fasce[i].end, element.fasce[i].name, fascia.end);
                if (ret) break;
            }
            if (ret) break;
        }
        return ret
    }

    sovraPopover(ev) {
        if(this.sovrapp) {
            let popover = this.popoverCtrl.create(PopoverPage, {}, {cssClass: 'alert-popover'});
            popover.present({
                ev : ev
            });
        }
    }

    timepickerPresent(ev, item, ctrl) {
        let popover = this.popoverCtrl.create(PopoverTimepicker, {'oggetto' : item, 'ctrl': ctrl}, {cssClass: 'timepicker-popover'});
        popover.present({
            ev : ev
        });

        popover.onWillDismiss(() => {
            this.changeFascia(item);
        })
    }
}