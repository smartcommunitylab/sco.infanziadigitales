import { BusModal } from './../Components/Modals/busModal/busModal';
import { Bus } from './../../app/Classes/bus';
import { Group } from './../../app/Classes/group';
import { GroupModal } from './../Components/Modals/groupModal/groupModal';
import { WebService } from './../../app/WebService';
import { School } from './../../app/Classes/school';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { LoginService } from '../../services/login.service'
import { UserService } from "../../services/user.service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styles: [`
    ion-navbar{
      padding-bottom:0
    }
    ion-header::after {
      background-image: none;
    }
    .segment-button {
      border-bottom: 4px solid #98ba3c;
      font-size: 14px;
      font-weight: bold;
    }
    .segment-button.segment-activated {
      border-bottom: 4px solid #98ba3c
    }
    ion-segment-button.segment-activated {
      background-color : #98ba3c;
    }
  `]
})
export class HomePage implements OnInit {
  schools: School[];

  settings:string = "profilo";

  selectedSchool : School;
  selectedId : string;

  constructor(public navCtrl: NavController, private webService : WebService, public alertCtrl: AlertController, public modalCtrl: ModalController, public loginService : LoginService, private userService : UserService) {}

  ngOnInit(): void {
    let authorizedSchools = this.userService.getAuthorizedSchools();
    if(authorizedSchools.length == 0) {
      console.log('user cannot manage any schools');
    } 
    this.schools = this.userService.getAuthorizedSchools();
    this.selectedId = this.userService.getAuthorizedSchools()[0].id;
    this.onSchoolChange(this.selectedId);
  }

  onSchoolChange(selectedId : string) {
    this.webService.getSchool(selectedId).then(school => {
      this.selectedSchool = school;
      this.webService.getTeachers(selectedId).then(teachers => this.selectedSchool.teachers = teachers);
      this.webService.getKids(selectedId).then(kids => this.selectedSchool.kids = kids);
      this.webService.getGroups(selectedId).then(groups => this.selectedSchool.groups = groups);
      }
    );
  }

  onSegmentChange() {
    //this.webService.getSchool(this.selectedId).then(x => this.selectedSchool = x)
  }

  logout() {
    this.loginService.logout();
    window.location.reload();
  }
}
