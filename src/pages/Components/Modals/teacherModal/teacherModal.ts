import { Group } from './../../../../app/Classes/group';
import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

@Component({
  selector: 'teacher-modal',
  templateUrl: 'teacherModal.html',
})

export class TeacherModal implements OnInit{ 
    selectedTeacher: Teacher;
  newTeacher : Teacher;
  newTeacherGroups : Group[];
  school : School;
  isNew : boolean = false;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService) {
    this.school = this.params.get('school') as School;
    this.selectedTeacher = this.params.get('teacher') as Teacher;
    this.isNew = this.params.get('isNew') as boolean;

    this.newTeacher = new Teacher('', '', '');
    this.newTeacher.id = this.selectedTeacher.id;
    this.newTeacher.name = this.selectedTeacher.name;
    this.newTeacher.surname = this.selectedTeacher.surname;
    this.newTeacher.cellphone = this.selectedTeacher.cellphone;
    this.newTeacher.telephone = this.selectedTeacher.telephone;
    this.newTeacher.email = this.selectedTeacher.email;
    this.newTeacher.pin = this.selectedTeacher.pin;
  }

    ngOnInit(): void {
        this.newTeacherGroups = this.school.groups.filter(x=>x.teachers.findIndex(c=>c.id === this.newTeacher.id) >= 0)
    }

  close() {
    this.navCtrl.pop();
  }

  save() {
    this.selectedTeacher.id = this.newTeacher.id;
    this.selectedTeacher.name = this.newTeacher.name;
    this.selectedTeacher.surname = this.newTeacher.surname;
    this.selectedTeacher.cellphone = this.newTeacher.cellphone;
    this.selectedTeacher.telephone = this.newTeacher.telephone;
    this.selectedTeacher.email = this.newTeacher.email;
    this.selectedTeacher.pin = this.newTeacher.pin;

    if(this.isNew) {
      console.log(this.selectedTeacher);
      if(this.school.teachers.findIndex(x => x.id.toLowerCase() === this.selectedTeacher.id.toLowerCase()) < 0)
        this.webService.add(this.school.id, this.newTeacher).then(tmp => this.school.teachers.push(tmp.teachers[tmp.teachers.length - 1]));
    }
    this.navCtrl.pop();
  }

  removeGroup(group : Group) {
    group.teachers.splice(group.teachers.findIndex(x=>x.id == this.newTeacher.id), 1);
  }
}