import { Group } from './../../../app/Classes/group';
import { TeacherModal } from './../Modals/teacherModal/teacherModal';
import { Teacher } from './../../../app/Classes/teacher';
import { WebService } from './../../../app/WebService';
import { School } from './../../../app/Classes/school';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'insegnanti',
  templateUrl: 'teacher-component.html'
})

export class Insegnanti implements OnInit {
  @Input() selectedSchool: School; 
  toDeleteTeacher : Teacher;
  ordine: string = '0';
  filtro : string = '0';
  filteredTeacher : Teacher[];
  teacherGroups : Group[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.filteredTeacher = this.selectedSchool.teachers;
  }

  showTeacherModal(item: Teacher, isNew : boolean) {
    let modal = this.modalCtrl.create(TeacherModal, {'teacher' : item, 'school' : this.selectedSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.present();
  }

  newTeacherModal() {
    var newTeacher =  new Teacher('', '', '');
    this.showTeacherModal(newTeacher, true);
  }

  deleteTeacher(item : Teacher) {
    this.toDeleteTeacher = new Teacher(item.id, item.name, item.surname);
    this.webService.remove(this.selectedSchool.id, this.toDeleteTeacher).then(tmp=> {this.selectedSchool.teachers = []; tmp.teachers.forEach(x=>this.selectedSchool.teachers.push(x)); this.filteredTeacher = this.selectedSchool.teachers});
  }

  onOrdineChange(ordine : string) {
    console.log(ordine);
    switch(ordine) {
      case '0':
        this.filteredTeacher.sort((item1, item2) => item1.name.localeCompare(item2.name));
      break;
      case '1':
        this.filteredTeacher.sort((item1, item2) => item2.name.localeCompare(item1.name));
      break;
    }
  }

  onFiltroTeacherChange(filtro : string) {
    switch(filtro) {
      case '0':
        this.filteredTeacher = this.selectedSchool.teachers;
      break;
    }
  }

  searchTeachers(item : any) {
    this.filteredTeacher = this.selectedSchool.teachers;
    let val = item.target.value;
    if(val && val.trim() !== '') {
      this.filteredTeacher = this.filteredTeacher.filter(x => {
        var tmp = x.name;
        return (tmp.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }
}