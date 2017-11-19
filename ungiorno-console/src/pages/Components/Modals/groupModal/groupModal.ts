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

  apiUrl: string;

  constructor(public params: NavParams, public toastCtrl: ToastController, public navCtrl: NavController, private webService: WebService, public alertCtrl: AlertController, private configService: ConfigService,
  ) {
    this.selectedSchool = this.params.get('school') as School;
    this.selectedGroup = this.params.get('group') as Group;
    this.isNew = this.params.get('isNew') as boolean;

    Object.assign(this.copiedGroup, this.selectedGroup) //copia profonda dei due oggetti    
    this.copiedGroup.kids = this.selectedGroup.kids.slice();
    this.copiedGroup.teachers = this.selectedGroup.teachers.slice();
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
            if (this.isNew && this.selectedSchool.groups.findIndex(x => x.name.toLowerCase() == this.selectedGroup.name.toLowerCase()) >= 0) {
              let toastConflict = this.toastCtrl.create({
                message: 'Elemento già presente (conflitto di nomi)',
                duration: 3000,
                position: 'middle',
                dismissOnPageChange: true

              });
              toastConflict.present();
              return;
            }
              
            // kids to be removed / added
            let oldKids = {};
            let toRemoveKids = [];
            let toAddKids = [];
            this.selectedGroup.kids.forEach(kid => oldKids[kid] = true);
            this.copiedGroup.kids.forEach(kid => {
              if (!oldKids[kid]) toAddKids.push(kid);
              oldKids[kid] = null;
            });
            for (let kid in oldKids) {
              if (oldKids[kid]) toRemoveKids.push(kid);
            }

            // teachers to be removed / added
            let oldTeachers = {};
            let toRemoveTeachers = [];
            let toAddTeachers = [];
            this.selectedGroup.teachers.forEach(t => oldTeachers[t] = true);
            this.copiedGroup.teachers.forEach(t => {
              if (!oldTeachers[t]) toAddTeachers.push(t);
              oldTeachers[t] = null;
            });
            for (let t in oldTeachers) {
              if (oldTeachers[t]) toRemoveTeachers.push(t);
            }            

            let promises = [];
            if (this.isNew) {
              let tmpSchool = School.copy(this.selectedSchool);
              tmpSchool.groups.push(this.copiedGroup);
              promises.push(this.webService.update(this.selectedSchool));
            }
            toAddKids.forEach(kidId => {
              if (this.copiedGroup.section) {
                promises.push(this.webService.putKidInSection(this.selectedSchool, kidId, this.selectedGroup));
              } else {
                promises.push(this.webService.addKidToGroup(this.selectedSchool, kidId, this.selectedGroup));
              }
            });
            toRemoveKids.forEach(kidId => {
              if (this.selectedGroup.section) {
                promises.push(this.webService.removeKidFromSection(this.selectedSchool, kidId, this.selectedGroup.name));
              } else {
                promises.push(this.webService.removeKidFromGroup(this.selectedSchool, kidId, this.selectedGroup.name));
              }
            });
            toAddTeachers.forEach(teacherId => {
              promises.push(this.webService.addTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name));
            });
            toRemoveTeachers.forEach(teacherId => {
              promises.push(this.webService.removeTeacherToSectionOrGroup(this.selectedSchool, teacherId, this.selectedGroup.name));
            });            
            Promise.all(promises).then(data => {
              Object.assign(this.selectedGroup, this.copiedGroup) //copia profonda dei due oggetti    
              this.selectedGroup.kids = this.copiedGroup.kids.slice();
              this.selectedGroup.teachers = this.copiedGroup.teachers.slice();                        
              // update kid objects: 
              // - if removed, set section to null
              // - if added, set section
              if (this.selectedGroup.section) {
                this.selectedSchool.kids.forEach(kid => {
                  if (toAddKids.indexOf(kid.id) >= 0) kid.section = this.selectedGroup.name;
                  if (toRemoveKids.indexOf(kid.id)>= 0) kid.section = null;
                });
              }
              this.navCtrl.pop(); 
            }, err => {
              // TODO handle error
            });
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
    this.selectedGroupTeachers.sort(this.compare);

    this.copiedGroup.kids.forEach(x => {
      this.selectedGroupKids.push(this.selectedSchool.kids.find(f => f.id.toLowerCase() === x.toLowerCase()));
    });
    this.selectedGroupKids.sort(this.compare);
    

  }

  private compare(item1, item2) {
    return item1.surname.localeCompare(item2.surname) != 0 ? item1.surname.localeCompare(item2.surname) : item1.name.localeCompare(item2.name);
  }


  addTeacher() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi insegnanti');
    let allTeachers =  this.selectedSchool.teachers.slice();
    allTeachers.sort(this.compare);
    allTeachers.forEach(element => { //creazione lista di checkbox in alert
      let checked = this.copiedGroup.teachers.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0;
      let disabled = checked;
      alert.addInput({
        type: 'checkbox',
        label: element.surname + ' ' + element.name,
        value: element.id,
        checked: checked,
        disabled: checked
      })
    });
    alert.addButton({
      text: 'Annulla'
    }); 
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!data) this.copiedGroup.teachers = [];
        this.copiedGroup.teachers = data;
        this.updateArrays();
      }
    })
    alert.present();
  }

  addKid() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    let allKids = this.selectedSchool.kids.slice();
    allKids.sort(this.compare);

    allKids.forEach(element => {
      let checked = this.copiedGroup.kids.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0;
      let disabled = checked;
      let label = element.surname + ' ' + element.name;
      // if this is a section. disable a possibility to add a kid if he already belongs to another section
      if (!disabled && this.copiedGroup.section && !!element.section && this.copiedGroup.name != element.section) {
        disabled = true;
        label += `(sezione '${element.section}')`;
      }

      alert.addInput({
        type: 'checkbox',
        label: label,
        value: element.id,
        checked: checked,
        disabled: disabled
      })
    });

    alert.addButton({
      text: 'Annulla'
    });
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!data) this.copiedGroup.kids = [];
        this.copiedGroup.kids = data;
        this.updateArrays();        
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
            this.updateArrays();
          }
        }
      ]
    })
    alert.present();
  }
}