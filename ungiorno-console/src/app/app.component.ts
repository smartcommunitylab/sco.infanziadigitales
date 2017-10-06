import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {LoginService, LOGIN_STATUS} from '../services/login.service';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private login: LoginService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      login.checkLoginStatus().then(
        status => {
          switch (status) {
            case LOGIN_STATUS.EXISTING: {
              console.log('login ok')
              this.rootPage = HomePage;
              break;
            } 
            default : 
              this.rootPage = LoginPage;
              console.log('default case..loginpage')
          }          
        },
        error => {
          // TODO: handle error
        }
      );
    });
  }
}

