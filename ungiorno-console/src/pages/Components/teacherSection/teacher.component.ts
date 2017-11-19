import { Group } from './../../../app/Classes/group';
import { TeacherModal } from './../Modals/teacherModal/teacherModal';
import { Teacher } from './../../../app/Classes/teacher';
import { WebService } from './../../../services/WebService';
import { School } from './../../../app/Classes/school';
import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';

@Component({
  selector: 'insegnanti',
  templateUrl: 'teacher-component.html'
})

export class Insegnanti implements OnInit {
  @Input() selectedSchool: School; 
  
  ordine: string = '0';
  filtro : string = '0';
  searchString: string = '';
  filteredTeacher : Teacher[];

  constructor(private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.onFiltroTeacherChange(this.filtro);
  }

  showTeacherModal(item: Teacher, isNew : boolean) {
    let modal = this.modalCtrl.create(TeacherModal, {'teacher' : item, 'school' : this.selectedSchool, 'isNew' : isNew}, {enableBackdropDismiss: false, showBackdrop: false});
    modal.onDidDismiss(data => {
      this.onFiltroTeacherChange(this.filtro);      
    });
    modal.present();
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
            this.webService.remove(this.selectedSchool, item).then(() => {
              this.selectedSchool.teachers = this.selectedSchool.teachers.filter(teacher => teacher.id.toLowerCase() != item.id.toLowerCase());
              this.onFiltroTeacherChange(this.filtro);
            });
          }
        }
      ]
    })
    alert.present();
  }

  onOrdineChange(ordine : string) {
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
        this.filteredTeacher = this.selectedSchool.teachers.filter(x => true);
      break;
    }

    this.applySearchFilter(this.searchString);
    this.onOrdineChange(this.ordine);
  }

  private applySearchFilter(val: string) {
    if(val && val.trim() !== '') {
      this.filteredTeacher = this.filteredTeacher.filter(x => {
        var tmpN = x.name;
        var tmpS = x.surname;
        return (tmpN.toLowerCase().indexOf(val.toLowerCase()) >= 0 || tmpS.toLowerCase().indexOf(val.toLowerCase()) >= 0);
      })
    }
  }

  searchTeachers(item : any) {
    this.filteredTeacher = this.selectedSchool.teachers;
    let val = item.target.value;
    this.applySearchFilter(this.searchString);
  }
}