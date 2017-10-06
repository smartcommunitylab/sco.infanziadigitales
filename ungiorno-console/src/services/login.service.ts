import { Injectable }    from '@angular/core';
import {Http,RequestOptions,Headers} from '@angular/http'
import {ConfigService} from './config.service'
import {WebService} from '../app/WebService'
import {UserService} from './user.service'
import 'rxjs/add/operator/toPromise';

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
    window.location = `${ this.config.getConfig('aacUrl') }/eauth/authorize?client_id=${ this.config.getConfig('aacClientId') }&redirect_uri=${ this.config.getConfig('redirectUrl') }&response_type=token`;
  }

  /**
   * Logout the user from the portal
   */
  logout(): Promise<boolean> {
    // TODO: revoke token and return true
    sessionStorage.clear();
    return Promise.resolve(true);
  }

  serverLogout(): void {
    window.location = this.config.getConfig('aacUrl') + '/logout?target=' + window.location.href;
  }

  /**
   * Check status of the login. Return LOGIN_STATUS value
   */
  checkLoginStatus():Promise<LOGIN_STATUS> {
    if(!this.enableOauth) {
      return Promise.resolve(LOGIN_STATUS.EXISTING);
    }
    if (!sessionStorage.access_token) {
      return Promise.resolve(LOGIN_STATUS.NOTSIGNEDIN);
    }
    console.log('TOKEN ' + sessionStorage.access_token);
    return new Promise((resolve, reject) => {
      this.connectorService.getProfile().then(response =>{
        //check the case
        console.log('profile response ' + JSON.stringify(response));
        this.userService.setUserId(response.data.username);
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
        resolve(LOGIN_STATUS.NOTSIGNEDIN);
      }); 
      
    });
  }
 
  /**
   * Return AAC access token if present
   */
  getToken(): string {
    return sessionStorage.getItem('access_token');
  }
 
}
