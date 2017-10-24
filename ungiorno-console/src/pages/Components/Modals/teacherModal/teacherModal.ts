import { Group } from './../../../../app/Classes/group';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from '../../../../services/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController, ToastController } from "ionic-angular";

@Component({
  selector: 'teacher-modal',
  templateUrl: 'teacherModal.html',
  styles: [
    `
      ion-card-header {
            font-size: 20px !important;
            background-color: rgba(152,186,60, .4);
        }
    `
  ]
})

export class TeacherModal implements OnInit {
  selectedSchool: School;

  selectedTeacher: Teacher;
  copiedTeacher: Teacher = new Teacher('', '', '', '');

  selectedTeacherGroups: Group[];

  isNew: boolean;
  toastWrongEmail;
  BreakEmailException = {};
  constructor(public params: NavParams,
    public navCtrl: NavController,
    private webService: WebService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController) {
    this.selectedSchool = this.params.get('school') as School;
    this.selectedTeacher = this.params.get('teacher') as Teacher;
    this.isNew = this.params.get('isNew') as boolean;

    Object.assign(this.copiedTeacher, this.selectedTeacher);
  }

  ngOnInit(): void {
    this.updateArray();
  }

  updateArray() {
    this.selectedTeacherGroups = [];

    this.selectedSchool.groups.forEach(group => {
      group.teachers.forEach(teacherId => {
        if (teacherId.toLowerCase() === this.copiedTeacher.id.toLowerCase()) this.selectedTeacherGroups.push(group);
      })
    })

    this.webService.update(this.selectedSchool);
  }

  close() {
    let alert = this.alertCtrl.create({
      subTitle: 'Eventuali modifiche verrano perse. Confermi?',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    })
    alert.present();

  }

  private validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  checkEmail() {
    if (!this.validateEmail(this.copiedTeacher.email))
      throw this.BreakEmailException
  }
  save() {
    try {
      this.checkEmail();


      let alert = this.alertCtrl.create({
        subTitle: 'Eventuali modifiche verrano confermate. Confermi?',
        buttons: [
          {
            text: "Annulla"
          },
          {
            text: 'OK',
            handler: () => {
              Object.assign(this.selectedTeacher, this.copiedTeacher);

              if (this.isNew) {
                if (this.selectedSchool.teachers.findIndex(x => x.id.toLowerCase() === this.selectedTeacher.id.toLowerCase()) < 0) {
                  this.webService.add(this.selectedSchool, this.copiedTeacher).then(() => this.selectedSchool.teachers.push(this.selectedTeacher));
                }
                else {
                  let toastConflict = this.toastCtrl.create({
                    message: 'Elemento già presente (conflitto di nomi)',
                    duration: 3000,
                    position: 'middle',
                    dismissOnPageChange: true

                  });
                  toastConflict.present()
                  // let alert = this.alertCtrl.create({
                  //   subTitle: 'Elemento già presente (conflitto di C.F)',
                  //   buttons: ['OK']
                  // });
                  // alert.present();
                }
              } else {
                this.webService.add(this.selectedSchool, this.copiedTeacher);
              }
              this.navCtrl.pop();
            }
          }
        ]
      })
      alert.present();
    } catch (e) {
      if (e == this.BreakEmailException) {
        this.toastWrongEmail = this.toastCtrl.create({
          message: 'Formato email non valido',
          duration: 1000,
          position: 'middle',
          dismissOnPageChange: true
        });
        this.toastWrongEmail.present();
      }
    }
  }
  onRemoveGroup(group: Group) {
    group.teachers.splice(group.teachers.findIndex(x => x.toLowerCase() == this.copiedTeacher.id.toLowerCase()), 1);
    this.updateArray();
  }
  generatePin() {
    //popup di richiesta
    let alert = this.alertCtrl.create({
      title: 'Creazione/ripristino PIN',
      subTitle: 'Premendo OK un nuovo PIN verrà spedito all’indirizzo email indicato, disabilitando il PIN precedente.',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.webService.generatePIN(this.selectedSchool, this.selectedTeacher).then(() => {
              var toast = this.toastCtrl.create({
                message: "L’email è stata spedita con successo",
                duration: 3000,
                position: 'middle'
              });
              toast.present();

            }, () => {
              var toast = this.toastCtrl.create({
                message: 'Purtroppo l’email non è stata inviata',
                duration: 3000,
                position: 'middle'
              });
              toast.present();
            });
          }
        }
      ]
    })
    alert.present();
  }
}