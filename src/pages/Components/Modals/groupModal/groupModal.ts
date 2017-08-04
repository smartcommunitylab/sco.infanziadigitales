import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Group } from './../../../../app/Classes/group';
import { Component, OnInit } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

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

export class GroupModal implements OnInit{
  selectedSchool : School;

  selectedGroup: Group; //gruppo selezionato
  copiedGroup : Group = new Group('', [], false, []); //copia profonda del gruppo selezionato (per possibilita annulla modifiche)

  selectedGroupKids : Kid[] = []; //vettore di istanze kid
  selectedGroupTeachers : Teacher[] = []; //vettore di istanza teacher

  isNew : boolean; //true if the group is new

  disabledSection : boolean;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
    this.selectedSchool = this.params.get('school') as School;
    this.selectedGroup = this.params.get('group') as Group;
    this.isNew = this.params.get('isNew') as boolean;

    Object.assign(this.copiedGroup, this.selectedGroup) //copia profonda dei due oggetti    
    this.copiedGroup.kids = new Array();
    this.selectedGroup.kids.forEach(x => this.copiedGroup.kids.push(x))
    this.copiedGroup.teachers = new Array();
    this.selectedGroup.teachers.forEach(x => this.copiedGroup.teachers.push(x))
  }

  ngOnInit() {
    this.updateArrays()
  }

  close() {
    this.webService.update(this.selectedSchool);
    this.navCtrl.pop();
  }

  save() {
    Object.assign(this.selectedGroup, this.copiedGroup); //copia profonda contraria (passaggio modifiche)
    this.selectedGroup.kids = new Array();
    this.copiedGroup.kids.forEach(x => this.selectedGroup.kids.push(x))
    this.selectedGroup.teachers = new Array();
    this.copiedGroup.teachers.forEach(x => this.selectedGroup.teachers.push(x))

    if(this.isNew) {
      if(this.selectedSchool.groups.findIndex(x => x.name.toLowerCase() == this.selectedGroup.name.toLowerCase()) < 0) {
        this.webService.add(this.selectedSchool.id, this.copiedGroup).then(tmp => this.selectedSchool.groups.push(tmp.groups[tmp.groups.length - 1]));
        this.webService.update(this.selectedSchool);
      }
      else {
        let alert = this.alertCtrl.create({
          subTitle: 'Elemento già presente (conflitto di nomi)',
          buttons: ['OK']
        });
        alert.present();
      }
    }
    this.close();
  }

  updateArrays() {
    this.selectedGroupKids = [];
    this.selectedGroupTeachers = [];

    this.copiedGroup.teachers.forEach(x=>{
      this.selectedGroupTeachers.push(this.selectedSchool.teachers.find(f=>f.id.toLowerCase() === x.toLowerCase()));
    });

    this.copiedGroup.kids.forEach(x=>{
      this.selectedGroupKids.push(this.selectedSchool.kids.find(f=>f.id.toLowerCase() === x.toLowerCase()));
    });
    
    this.webService.update(this.selectedSchool);
  }
  
  addTeacher() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi insegnanti');
    
    this.selectedSchool.teachers.forEach(element => { //creazione lista di checkbox in alert
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: element.id,
        checked: this.copiedGroup.teachers.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0
      })
    });
    alert.addButton('Annulla'); //tasto annulla
    this.copiedGroup.teachers = [];
    alert.addButton({
      text: 'OK',
      handler: data => {
        data.forEach(element => {
          this.copiedGroup.teachers.push(element) //inserimento id teacher in istanza copiedGroup
          this.updateArrays();
        });
      }
    })
    alert.present();
  }
  
  addKid() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    
    this.selectedSchool.kids.forEach(element => {
      if(this.copiedGroup.section && element.section) return
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: element.id,
        checked: this.copiedGroup.kids.findIndex(x => x.toLowerCase() === element.id.toLowerCase()) >= 0
      })
    });

    this.copiedGroup.kids = [];
    alert.addButton('Annulla');
    alert.addButton({
      text: 'OK',
      handler: data => {
        data.forEach(element => {
          this.copiedGroup.kids.push(element);
          if(this.copiedGroup.section) this.selectedSchool.kids.find(c=> c.id.toLowerCase() === element.toLowerCase()).section = true;
          this.updateArrays();
        });
      }
    })
    alert.present();
  }

  removeKid(id : string) {
    this.copiedGroup.kids.splice(this.copiedGroup.kids.findIndex(x => id === x), 1);
    this.selectedSchool.kids.find(c=> c.id.toLowerCase() === id.toLowerCase()).section = false;
    this.updateArrays();
  }

  removeTeacher(teacher: Teacher) {
    this.copiedGroup.teachers.splice(this.copiedGroup.teachers.findIndex(x => teacher.id == x), 1);
    this.updateArrays();
  }
}