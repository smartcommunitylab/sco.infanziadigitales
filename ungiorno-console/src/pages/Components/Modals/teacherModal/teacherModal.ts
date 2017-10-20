import { Group } from './../../../../app/Classes/group';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from '../../../../services/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

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

export class TeacherModal implements OnInit{ 
  selectedSchool : School;

  selectedTeacher: Teacher;
  copiedTeacher : Teacher = new Teacher('', '' ,'', '');
  
  selectedTeacherGroups : Group[];

  isNew : boolean;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, private alertCtrl : AlertController) {
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
        if(teacherId.toLowerCase() === this.copiedTeacher.id.toLowerCase()) this.selectedTeacherGroups.push(group);
      })
    })

    this.webService.update(this.selectedSchool);
  }

  close() {
    this.navCtrl.pop();
  }

  save() {
    Object.assign(this.selectedTeacher, this.copiedTeacher);

    if(this.isNew) {
      if(this.selectedSchool.teachers.findIndex(x => x.id.toLowerCase() === this.selectedTeacher.id.toLowerCase()) < 0) {
        this.webService.add(this.selectedSchool, this.copiedTeacher).then(() => this.selectedSchool.teachers.push(this.selectedTeacher));
      }
      else {
        let alert = this.alertCtrl.create({
          subTitle: 'Elemento già presente (conflitto di C.F)',
          buttons: ['OK']
        });
        alert.present();
      }
    }else {
      this.webService.add(this.selectedSchool, this.copiedTeacher);
    }

    this.close();
  }

  onRemoveGroup(group : Group) {
    group.teachers.splice(group.teachers.findIndex(x=>x.toLowerCase() == this.copiedTeacher.id.toLowerCase()), 1);
    this.updateArray();
  }
  generatePin() {
    //popup di richiesta
        let alert = this.alertCtrl.create({
          title: 'Creazione PIN',
      subTitle: 'Sei sicuro di voler continuare?',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.webService.generatePIN(this.selectedSchool, this.copiedTeacher);
          }
        }
      ]
    })
    alert.present();
  }
}