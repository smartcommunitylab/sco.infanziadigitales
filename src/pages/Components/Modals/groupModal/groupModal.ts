import { Kid } from './../../../../app/Classes/kid';
import { Teacher } from './../../../../app/Classes/teacher';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { School } from './../../../../app/Classes/school';
import { WebService } from './../../../../app/WebService';
import { Group } from './../../../../app/Classes/group';
import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from "ionic-angular";

@Component({
  selector: 'group-modal',
  templateUrl: 'groupModal.html',
})

export class GroupModal {
  selectedGroup: Group;
  newGroup : Group;
  school : School;
  isNew : boolean = false;

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
    this.school = this.params.get('school') as School;
    this.selectedGroup = this.params.get('group') as Group;
    this.isNew = this.params.get('isNew') as boolean;

    this.newGroup = new Group('', [], false, []);
    this.newGroup.name = this.selectedGroup.name;
    this.selectedGroup.kids.forEach(x => this.newGroup.kids.push(x) )
    this.newGroup.section = this.selectedGroup.section;
    this.selectedGroup.teachers.forEach(x=> this.newGroup.teachers.push(x));
  }

  close() {
    this.navCtrl.pop();
  }

  save() {
    this.selectedGroup.name = this.newGroup.name;
    this.selectedGroup.kids = new Array();
    this.newGroup.kids.forEach(x => this.selectedGroup.kids.push(x) )
    this.selectedGroup.section = this.newGroup.section;
    this.selectedGroup.teachers = new Array();
    this.newGroup.teachers.forEach(x=> {this.selectedGroup.teachers.push(x)});

    //console.log(this.school);

    if(this.isNew) {
      //console.log(this.selectedGroup);
      if(this.school.groups.findIndex(x => x.name.toLowerCase() == this.selectedGroup.name.toLowerCase()) < 0)
        this.webService.add(this.school.id, this.newGroup).then(tmp => this.school.groups.push(tmp.groups[tmp.groups.length - 1]));
    }
    this.webService.update(this.school);
    this.navCtrl.pop();
  }
  
  addTeacher() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi insegnanti');
    
    this.school.teachers.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: JSON.stringify(element),
        checked: this.newGroup.teachers.findIndex(x => x.id === element.id) >= 0
      })
    });

    alert.addButton('Annulla');
    alert.addButton({
      text: 'OK',
      handler: data => {
        var x = new Array();
        data.forEach(element => {
          x.push(JSON.parse(element) as Teacher)
        });
        this.newGroup.teachers = x
      }
    })
    alert.present();
  }

  addKid() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Aggiungi bambini');
    
    this.school.kids.forEach(element => {
      alert.addInput({
        type: 'checkbox',
        label: element.name + ' ' + element.surname,
        value: JSON.stringify(element),
        checked: this.newGroup.kids.findIndex(x => x.id === element.id) >= 0
      })
    });

    alert.addButton('Annulla');
    alert.addButton({
      text: 'OK',
      handler: data => {
        var x = new Array();
        data.forEach(element => {
          x.push(JSON.parse(element) as Kid)
        });
        this.newGroup.kids = x
      }
    })
    alert.present();
  }

  removeKid(kid : Kid) {
    this.newGroup.kids.splice(this.newGroup.kids.findIndex(x => kid.id == x.id), 1);
  }

  removeTeacher(teacher: Teacher) {
    this.newGroup.teachers.splice(this.newGroup.teachers.findIndex(x => teacher.id == x.id), 1);
  }
}