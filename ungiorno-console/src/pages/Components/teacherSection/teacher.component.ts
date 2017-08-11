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
  thisSchool : School = new School();

  toDeleteTeacher : Teacher;

  ordine: string = '0';
  filtro : string = '0';
  filteredTeacher : Teacher[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    Object.assign(this.thisSchool, this.selectedSchool);
    this.filteredTeacher = this.selectedSchool.teachers;
    this.onFiltroTeacherChange(this.filtro);
  }

  showTeacherModal(item: Teacher, isNew : boolean) {
    let modal = this.modalCtrl.create(TeacherModal, {'teacher' : item, 'school' : this.thisSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.present().then(x=>{
      Object.assign(this.selectedSchool, this.thisSchool);
    });
  }

  newTeacherModal() {
    var newTeacher =  new Teacher('', '', '', '');
    this.showTeacherModal(newTeacher, true);
  }

  onDeleteTeacher(item : Teacher) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.thisSchool.teachers.splice(this.thisSchool.teachers.findIndex(tmp => tmp.id.toLowerCase() === item.id.toLowerCase()), 1);
            Object.assign(this.selectedSchool, this.thisSchool);
            this.webService.update(this.selectedSchool);
          }
        }
      ]
    })
    alert.present();
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
    this.onOrdineChange(this.ordine);
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