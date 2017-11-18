import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from '../../../../services/WebService';
import { Group } from './../../../../app/Classes/group';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController, ToastController } from "ionic-angular";
import { ConfigService } from '../../../../services/config.service';

@Component({
  selector: 'group-modal',
  templateUrl: 'groupModal.html',
  styles: [
    `
      ion-card-header {
            font-size: 20px !important;
            background-color: rgba(152,186,60, .4);
        }
    `
  ]
})

export class GroupModal implements OnInit {
  selectedSchool: School;

  selectedGroup: Group; //gruppo selezionato
  copiedGroup: Group = new Group('', [], false, []); //copia profonda del gruppo selezionato (per possibilita annulla modifiche)

  selectedGroupKids: Kid[] = []; //vettore di istanze kid
  selectedGroupTeachers: Teacher[] = []; //vettore di istanza teacher

  isNew: boolean; //true if the group is new


  addKidToGroupMap = {}
  removeKidToGroupMap = {}

  addTeacherToGroupMap = {}
  removeTeacherToGroupMap = {}
  apiUrl: string;

  constructor(public params: NavParams, public toastCtrl: ToastController, public navCtrl: NavController, private webService: WebService, public alertCtrl: AlertController, private configService: ConfigService,
  ) {
    this.selectedSchool = this.params.get('school') as School;
    this.selectedGroup = this.params.get('group') as Group;
    this.isNew = this.params.get('isNew') as boolean;

    Object.assign(this.copiedGroup, this.selectedGroup) //copia profonda dei due oggetti    
    this.copiedGroup.kids = new Array();
    this.selectedGroup.kids.forEach(x => this.copiedGroup.kids.push(x))
    this.copiedGroup.teachers = new Array();
    this.selectedGroup.teachers.forEach(x => this.copiedGroup.teachers.push(x))
    this.apiUrl = this.configService.getConfig('apiUrl');

  }

  ngOnInit() {
    this.updateArrays()
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

    let alert = this.alertCtrl.create({
      subTitle: 'Eventuali modifiche verrano confermate. Confermi?',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            Object.assign(this.selectedGroup, this.copiedGroup); //copia profonda contraria (passaggio modifiche)
            this.selectedGroup.kids = new Array();
            this.copiedGroup.kids.forEach(x => this.selectedGroup.kids.push(x))
            this.selectedGroup.teachers = new Array();
            this.copiedGroup.teachers.forEach(x => this.selectedGroup.teachers.push(x))

            if (this.isNew) {
              if (this.selectedSchool.groups.findIndex(x => x.name.toLowerCase() == this.selectedGroup.name.toLowerCase()) < 0) {
                this.selectedSchool.groups.push(this.selectedGroup);
                this.webService.update(this.selectedSchool);
                let kidsToAdd = this.addKidToGroupMap[this.selectedGroup.name]
                let kidsToRemove = this.removeKidToGroupMap[this.selectedGroup.name]
                let teacherToAdd = this.addTeacherToGroupMap[this.selectedGroup.name]
                let teacherToRemove = this.removeTeacherToGroupMap[this.selectedGroup.name]

                if (kidsToAdd != undefined) {
                  kidsToAdd.forEach(kidId => {
                    if (this.selectedGroup.section) {
                      this.webService.putKidInSection(this.selectedSchool, kidId, this.selectedGroup);
                    } else {
                      this.webService.addKidToGroup(this.selectedSchool, kidId, this.selectedGroup);
                    }
                  })
                }

                if (kidsToRemove != undefined) {
                  kidsToRemove.forEach(kidId => {
                    if (this.selectedGroup.section) {
                      this.webService.removeKidFromSection(this.selectedSchool, kidId, this.selectedGroup.name);
                    } else {
                      this.webService.removeKidFromGroup(this.selectedSchool, kidId, this.selectedGroup.name);
                    }
                  });
                }
                if (teacherToAdd != undefined) {
                  teacherToAdd.forEach(teacherId => {
                    this.webService.addTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name)
                  })
                }

                if (teacherToRemove != undefined) {
                  console.log('teacherToRemove ' + teacherToRemove);
                  teacherToRemove.forEach(teacherId => {
                    this.webService.removeTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name);
                  });
                }

                console.log("add kid " + JSON.stringify(this.addKidToGroupMap));
                console.log("remove kid " + JSON.stringify(this.removeKidToGroupMap));
                console.log("add teacher " + JSON.stringify(this.addTeacherToGroupMap));
                console.log("remove teacher " + JSON.stringify(this.removeTeacherToGroupMap));
              }
              else {
                let toastConflict = this.toastCtrl.create({
                  message: 'Elemento già presente (conflitto di nomi)',
                  duration: 3000,
                  position: 'middle',
                  dismissOnPageChange: true

                });
                toastConflict.present()
              }
            } else {
              // when edit a group I can only add or remove children or teacher
              // so there is not need to update group definition data in profile of school
              
              let kidsToAdd = this.addKidToGroupMap[this.selectedGroup.name]
              let kidsToRemove = this.removeKidToGroupMap[this.selectedGroup.name]
              let teacherToAdd = this.addTeacherToGroupMap[this.selectedGroup.name]
              let teacherToRemove = this.removeTeacherToGroupMap[this.selectedGroup.name]

              if (kidsToAdd != undefined) {
                kidsToAdd.forEach(kidId => {
                  if (this.selectedGroup.section) {
                    this.webService.putKidInSection(this.selectedSchool, kidId, this.selectedGroup);
                  } else {
                    this.webService.addKidToGroup(this.selectedSchool, kidId, this.selectedGroup);
                  }
                })
              }

              if (kidsToRemove != undefined) {
                kidsToRemove.forEach(kidId => {
                  if (this.selectedGroup.section) {
                    this.webService.removeKidFromSection(this.selectedSchool, kidId, this.selectedGroup.name);
                  } else {
                    this.webService.removeKidFromGroup(this.selectedSchool, kidId, this.selectedGroup.name);
                  }
                });
              }

              if (teacherToAdd != undefined) {
                teacherToAdd.forEach(teacherId => {
                  this.webService.addTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name)
                })
              }

              if (teacherToRemove != undefined) {
                console.log('teacherToRemove ' + teacherToRemove);
                teacherToRemove.forEach(teacherId => {
                  console.log('remove call ' + teacherId)
                  this.webService.removeTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name);
                });
              }
              console.log("add kid " + JSON.stringify(this.addKidToGroupMap));
              console.log("remove kid " + JSON.stringify(this.removeKidToGroupMap));
              console.log("add teacher " + JSON.stringify(this.addTeacherToGroupMap));
              console.log("remove teacher " + JSON.stringify(this.removeTeacherToGroupMap));
            }
            this.navCtrl.pop();
          }
        }
      ]
    })
    alert.present();

  }

  updateArrays() {
    this.selectedGroupKids = [];
    this.selectedGroupTeachers = [];

    this.copiedGroup.teachers.forEach(x => {
      this.selectedGroupTeachers.push(this.selectedSchool.teachers.find(f => f.id.toLowerCase() === x.toLowerCase()));
    });

    this.copiedGroup.kids.forEach(x => {
      this.selectedGroupKids.push(this.selectedSchool.kids.find(f => f.id.toLowerCase() === x.toLowerCase()));
    });


  }

  private compare(a,b) {
    if (a.surname < b.surname)
      return -1;
    if (a.surname > b.surname)
      return 1;
    return 0;
  }
  

  oldTeacher: string[]=[];
  addTeacher() {
    this.oldTeacher = [];
    this.copiedGroup.teachers.forEach(x => this.oldTeacher.push(x));
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi insegnanti');

    this.selectedSchool.teachers.forEach(element => { //creazione lista di checkbox in alert
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: element.id,
        checked: this.copiedGroup.teachers.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0,
        disabled: this.copiedGroup.teachers.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0
      })
    });
    alert.addButton({
      text: 'Annulla',
      handler: data => {
        if (!data)
        return
        data.forEach(element => {
          this.copiedGroup.teachers=[];
          this.oldTeacher.forEach(x => this.copiedGroup.teachers.push(x));

        });
      }
    }); //tasto annulla
    this.copiedGroup.teachers = [];
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!data)
        return
        data.forEach(element => {
          this.copiedGroup.teachers.push(element) //inserimento id teacher in istanza copiedGroup
          if (this.addTeacherToGroupMap[this.copiedGroup.name] == undefined) {
            this.addTeacherToGroupMap[this.copiedGroup.name] = []
          }
          this.addTeacherToGroupMap[this.copiedGroup.name].push(element)
          this.updateArrays();
        });
      }
    })
    alert.present();
  }


  oldKids: string[]=[];
  addKid() {
    this.oldKids = [];
    this.copiedGroup.kids.forEach(x => this.oldKids.push(x));
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    this.selectedSchool.kids.sort(this.compare);
   

    this.selectedSchool.kids.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: element.id,
        checked: this.copiedGroup.kids.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0,
        disabled: this.copiedGroup.kids.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0
      })
    });

    this.copiedGroup.kids = [];
    alert.addButton({
      text: 'Annulla',
      handler: data => {
        if (!data)
        return
          data.forEach(element => {
          this.copiedGroup.kids=[];
          this.oldKids.forEach(x => this.copiedGroup.kids.push(x));
        });
      }
    });
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!data)
        return
        data.forEach(element => {
          this.copiedGroup.kids.push(element);
          if (this.addKidToGroupMap[this.copiedGroup.name] == undefined) {
            this.addKidToGroupMap[this.copiedGroup.name] = []
          }
          this.addKidToGroupMap[this.copiedGroup.name].push(element)

          if (this.copiedGroup.section) this.selectedSchool.kids.find(c => c.id.toLowerCase() === element.toLowerCase()).section = this.copiedGroup.name;
          this.updateArrays();
        });
      }
    })
    alert.present();
  }
  getImage(child) {
    var image = this.apiUrl + "/picture/" + this.selectedSchool.appId + "/" + this.selectedSchool.id + "/" + child.id + "/" + sessionStorage.getItem('access_token');
    return image;
  }
  removeKid(id: string) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.copiedGroup.kids.splice(this.copiedGroup.kids.findIndex(x => id === x), 1);
            this.selectedSchool.kids.find(c => c.id.toLowerCase() === id.toLowerCase()).section = "";
            if (this.removeKidToGroupMap[this.copiedGroup.name] == undefined) {
              this.removeKidToGroupMap[this.copiedGroup.name] = []
            }
            this.removeKidToGroupMap[this.copiedGroup.name].push(id)
            this.updateArrays();
          }
        }
      ]
    })
    alert.present();

  }

  removeTeacher(teacher: Teacher) {
    let alert = this.alertCtrl.create({
      subTitle: 'Conferma eliminazione',
      buttons: [
        {
          text: "Annulla"
        },
        {
          text: 'OK',
          handler: () => {
            this.copiedGroup.teachers.splice(this.copiedGroup.teachers.findIndex(x => teacher.id == x), 1);
            if (this.removeTeacherToGroupMap[this.copiedGroup.name] == undefined) {
              this.removeTeacherToGroupMap[this.copiedGroup.name] = []
            }
            this.removeTeacherToGroupMap[this.copiedGroup.name].push(teacher.id)
            this.updateArrays();
          }
        }
      ]
    })
    alert.present();
  }
}