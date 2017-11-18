import { Injectable }    from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class CommonService  {

    static phoneValidator(val: string, toastCtrl: ToastController): boolean {
        if (!/^[0-9]{5,10}$/.test(val)) {
            let toastWrong = toastCtrl.create({
                message: 'Formato telefono non valido',
                duration: 1000,
                position: 'middle',
                dismissOnPageChange: true
            });
            toastWrong.present();
            return false;
        }
        return true;
    }
    static emailValidator(val: string, toastCtrl: ToastController): boolean {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(val)) {
            let toastWrong = toastCtrl.create({
                message: 'Formato email non valido',
                duration: 1000,
                position: 'middle',
                dismissOnPageChange: true
            });
            toastWrong.present();
            return false;
        }
        return true;
    }
}