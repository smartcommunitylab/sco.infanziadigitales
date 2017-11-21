import { Bus } from './../../app/Classes/bus';
import { Group } from './../../app/Classes/group';
import { GroupModal } from './../Components/Modals/groupModal/groupModal';
import { WebService } from '../../services/WebService';
import { School } from './../../app/Classes/school';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { App, NavController, AlertController, ModalController, LoadingController } from 'ionic-angular';
import { LoginService } from '../../services/login.service'
import { UserService } from "../../services/user.service";
import { APP_NAME } from '../../services/config.service';

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
      font-size: 18px;
      font-weight: bold;
    }
    .segment-button.segment-activated {
      border-bottom: 4px solid #98ba3c
    }
    ion-segment-button.segment-activated {
      background-color : #98ba3c;
    }
    .segment-md-light .segment-button.activated, .segment-md-light .segment-button.segment-activated {
  border-color: #f4f4f4;
  color: #f4f4f4;
  opacity: 1;
}
    .segment-md-light .segment-button {
    color: black;
}
  `]
})
export class HomePage implements OnInit {
  schools: School[];

  settings: string = "profilo";

  selectedSchool: School;
  selectedId: string;
  selectedAppId: string;
  rerender = false;
  constructor(
    public navCtrl: NavController,
    public _app: App,
    private webService: WebService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public loginService: LoginService,
    private cdRef: ChangeDetectorRef,
    private userService: UserService) { }

  ngOnInit(): void {
    let authorizedSchools = this.userService.getAuthorizedSchools();
    if (authorizedSchools.length == 0) {
      console.log('user cannot manage any schools');
      let alert = this.alertCtrl.create({
        title: 'Errore di login',
        subTitle: "L'account Google con cui ci si è autenticati non è associato ad alcuna scuola. Per eseguire il logout dall'account Google (vale per tutte le schede aperte del browser) premere OK, altrimenti premere ANNULLA.",
        buttons: [
          {
            text: "ANNULLA"
          },
          {
            text: "OK",
            handler: () => {
              this.loginService.logout(true);
            }
          }
        ]
      })
      alert.present();      
      return;
    }
    this.schools = this.userService.getAuthorizedSchools();
    if (this.schools && this.userService.getAuthorizedSchools()[0]) {
      this.selectedId = this.userService.getAuthorizedSchools()[0].id;
      this.selectedAppId = this.userService.getAuthorizedSchools()[0].appId;
      this.onSchoolChange(this.selectedAppId, this.selectedId);
    }

  }

  ionViewDidEnter() {
    this._app.setTitle(APP_NAME);
}

  doRerender() {
    this.rerender = true;
    this.cdRef.detectChanges();
    this.rerender = false;
  }
  changeSchool(selectedId: String) {
    let s: School[] = this.schools.filter(s => s.id === selectedId);
    console.log(s.length);
    if (s != undefined) {
      console.log(JSON.stringify(s));
      this.onSchoolChange(s[0].appId, s[0].id);
    }
    this.settings = "profilo"
  }
  onSchoolChange(selectedAppId: string, selectedId: string) {
    let loading = this.loadingCtrl.create({
    });

    loading.present();
    this.webService.getSchool(selectedAppId, selectedId).then(school => {
      this.selectedSchool = school;
      this.webService.getTeachers(this.selectedSchool).then(teachers => {
        this.selectedSchool.teachers = teachers;
        this.webService.getKids(this.selectedSchool).then(kids => {
          this.selectedSchool.kids = kids
          this.webService.getGroups(this.selectedSchool).then(groups => {
            this.selectedSchool.groups = groups;
            this.doRerender();
            loading.dismiss();
          }).catch((err => {
            loading.dismiss();
          }))
        }).catch((err => {
          loading.dismiss();
        }));
      }).catch((err => {
        loading.dismiss();
      }))

    }
    ).catch((err => {
      loading.dismiss();
    }));
  }

  onSegmentChange() {
    //this.webService.getSchool(this.selectedId).then(x => this.selectedSchool = x)
  }

  logout() {
    this.loginService.logout();
    // window.location.reload();
  }
}
