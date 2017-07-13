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

  constructor(public params: NavParams, public navCtrl:NavController, private webService : WebService, public alertCtrl : AlertController) {
    this.school = this.params.get('school');
    this.selectedGroup = this.params.get('group') as Group;

    this.newGroup = new Group(this.selectedGroup.name, this.selectedGroup.kids, this.selectedGroup.section, this.selectedGroup.teachers);
  }

  close() {
    this.navCtrl.pop();
  }

  save() {
    this.selectedGroup = new Group(this.newGroup.name, this.newGroup.kids, this.newGroup.section, this.newGroup.teachers)
    // console.log(this.selectedGroup);
    // if(this.school.groups.findIndex(x => x.name.toLowerCase() == this.selectedGroup.name.toLowerCase()) < 0)
    //   this.webService.add(this.school.id, this.newGroup).then(tmp => this.school.groups.push(tmp.groups[tmp.groups.length - 1]));
    
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
}