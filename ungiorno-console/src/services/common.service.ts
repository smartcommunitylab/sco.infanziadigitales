import { Injectable }    from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class CommonService  {
    private currentToast = null;

    constructor(private toastCtrl: ToastController) {
    }

    static phoneValidator(val: string, common: CommonService): boolean {
        if (!/^[0-9]{5,10}$/.test(val)) {
            common.showToast('Formato telefono non valido', null, 1000);
            return false;
        }
        return true;
    }
    static emailValidator(val: string, common: CommonService): boolean {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(val)) {
            common.showToast('Formato email non valido', null, 1000);
            return false;
        }
        return true;
    }

    showToast(text: string, position?: string, duration?: number) {
        try {
            this.currentToast.dismiss();
        } catch(e) {}

        this.currentToast = this.toastCtrl.create({
            message: text,
            duration: duration ? duration : 3000,
            position: position? position : 'middle',
            dismissOnPageChange: true
          });
          this.currentToast.present();
    
    }
}