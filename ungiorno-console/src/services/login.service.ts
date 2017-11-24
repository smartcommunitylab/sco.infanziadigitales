import { Injectable }    from '@angular/core';
import {Http,RequestOptions,Headers} from '@angular/http'
import {ConfigService} from './config.service'
import { WebService } from './WebService';
import {UserService} from './user.service'
import 'rxjs/add/operator/toPromise';
import { School } from "../app/Classes/school";

declare var window: any;

export enum LOGIN_STATUS {
      NOTSIGNEDIN,
      NEW,
      EXISTING  
}

@Injectable()
export class LoginService  {
  
  private enableOauth : boolean;

  constructor(private http: Http, private config: ConfigService, private connectorService: WebService, private userService : UserService) {
    this.enableOauth = this.config.getConfig('enableOauth');
  }
  

  login(): void {
    window.location = `${ this.config.getConfig('aacUrl') }/eauth/authorize/google?client_id=${ this.config.getConfig('aacClientId') }&redirect_uri=${ this.config.getConfig('redirectUrl') }&response_type=token&scope=profile.basicprofile.me,profile.accountprofile.me`;
  }

  /**
   * Logout the user from the portal and, if specified, also from the provider
   */
  logout(logoutProvider?: boolean): Promise<boolean> {
    // TODO: revoke token and return true
    sessionStorage.clear();
    this.serverLogout(logoutProvider);
    return Promise.resolve(true);
  }

  serverLogout(logoutProvider?: boolean): void {
    let redirect = null;
    if (logoutProvider) {
    // CONFIGURAZIONE NEL CASO DI SIGNOUT DA GOOGLE
      redirect = this.config.getConfig('aacUrl') + '/logout?target=https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=' + window.location.href;
    } else {
      redirect = this.config.getConfig('aacUrl') + '/logout?target=' + window.location.href;
    }
    window.location = this.config.getConfig('apiUrl') + '/logout?target='+redirect;
  }

  /**
   * Check status of the login. Return LOGIN_STATUS value
   */
  checkLoginStatus():Promise<LOGIN_STATUS> {
    if(!this.enableOauth) {
      let defaultSchools = [];
      let school = new School();
      school.id = 'scuola';
      defaultSchools.push(school);
      this.userService.setUserId('sco.infanzia.povo@gmail');
      this.userService.setAuthorizedSchools(defaultSchools);
      return Promise.resolve(LOGIN_STATUS.EXISTING);
    }
    if (!sessionStorage.access_token) {
      if (this.captureOauthToken()) {
        window.location.hash = '/home';
        window.location.reload();
        // this is useless, for consistency
        return Promise.resolve(LOGIN_STATUS.EXISTING);
      }
      return Promise.resolve(LOGIN_STATUS.NOTSIGNEDIN);
    }
    console.log('TOKEN ' + sessionStorage.access_token);
    return new Promise((resolve, reject) => {
      this.connectorService.getProfile().then(response =>{
        //check the case
        console.log('profile response ' + JSON.stringify(response));
        this.userService.setUserId(response.getUserId());
        this.userService.setAuthorizedSchools(response.getAuthorizedSchools());
        console.log('logged as ' + this.userService.getUserId());
        resolve(LOGIN_STATUS.EXISTING);
        // if (profile.authorized){
        //    resolve(LOGIN_STATUS.EXISTING);
        // }else {
        //    resolve(LOGIN_STATUS.NEW);
        // }
      },
      err => {
        // TODO handle error
        sessionStorage.clear();
        resolve(LOGIN_STATUS.NOTSIGNEDIN);
      }); 
      
    });
  }
 /**
  * Try to read access token from hash
  */
 private captureOauthToken() {
    if (!!sessionStorage.access_token && sessionStorage.access_token != 'null' && sessionStorage.access_token != 'undefined') return;
    console.log('capture token on index.html');
    var queryString = location.hash.substring(1);
    var params = {};
    var regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(queryString)) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      // Try to exchange the param values for an access token.
      if (params['access_token']) {
        sessionStorage.access_token = params['access_token'];
        return true;
      }
    }
    return false;
  } 
  /**
   * Return AAC access token if present
   */
  getToken(): string {
    return sessionStorage.getItem('access_token');
  }
 
}
