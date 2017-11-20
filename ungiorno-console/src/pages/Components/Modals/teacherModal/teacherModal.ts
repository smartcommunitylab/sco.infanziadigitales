import { Group } from './../../../../app/Classes/group';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from '../../../../services/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

import { CommonService } from '../../../../services/common.service';

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

  constructor(public params: NavParams,
    public navCtrl: NavController,
    private webService: WebService,
    private alertCtrl: AlertController,
    private common: CommonService) {
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


  save() {
    if (this.copiedTeacher.email && !CommonService.emailValidator(this.copiedTeacher.email, this.common)) return;

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
                this.webService.add(this.selectedSchool, this.copiedTeacher).then(() => {
                  this.selectedSchool.teachers.push(this.selectedTeacher);
                  this.navCtrl.pop();
                }, err => {
                  // TODO handle error
                });
              }
              else {
                this.common.showToast('Insegnante già presente (conflitto di C.F.)');
              }
            } else {
              this.webService.add(this.selectedSchool, this.copiedTeacher).then(() => {
                Object.assign(this.selectedTeacher, this.copiedTeacher);
                this.navCtrl.pop();
              }, err => {
                // TODO handle error
              });
            }
          }
        }
      ]
    })
    alert.present();
  }
  onRemoveGroup(group: Group) {
    group.teachers.splice(group.teachers.findIndex(x => x.toLowerCase() == this.copiedTeacher.id.toLowerCase()), 1);
    this.updateArray();
  }
  generatePin() {
    //popup di richiesta
    let alert = this.alertCtrl.create({
      title: 'Creazione/ripristino PIN',
      subTitle: 'Premendo OK un nuovo PIN verrà spedito all’indirizzo email '+this.selectedTeacher.email+', disabilitando il PIN precedente.',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.webService.generatePIN(this.selectedSchool, this.selectedTeacher).then(() => {
              this.common.showToast('L’email è stata spedita con successo');
            }, () => {
              this.common.showToast('Purtroppo l’email non è stata inviata');
            });
          }
        }
      ]
    })
    alert.present();
  }
}