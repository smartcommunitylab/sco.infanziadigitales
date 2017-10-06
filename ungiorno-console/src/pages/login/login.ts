import { Component,OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import {LoginService} from '../../services/login.service';
import {HomePage } from '../home/home';
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {

  constructor(public navCtrl: NavController, private loginService: LoginService) {

  }
  
  // get all the providers when the component is created
 ngOnInit(): void {
    this.loginService.login();
  }

}
