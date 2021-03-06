import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';

export const APP_NAME = 'Console UGAS';
class EnvData {
   env: string;
}
@Injectable()
export class ConfigService {

    private config: Object = null;
    private env:    Object = null;

    constructor(private http: Http, private storage:Storage) {

    }

    /**
     * Use to get the data found in the second file (config file)
     */
    public getConfig(key: any) {
        return this.config[key];
    }

    /**
     * Use to get the data found in the first file (env file)
     */
    public getEnv(key: any) {
        return this.env[key];
    }

    /**
     * This method:
     *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
     */
    public load() {
        return new Promise((resolve, reject) => {
            this.http.get('assets/conf/env.json').map( res =>
              res.json() ).catch((error: any):any => {
                console.log('Configuration file env.json could not be read');
                resolve(true);
                return Observable.throw(error.json().error || 'Server error');
            }).subscribe( (envResponse:EnvData) => {
                this.env = envResponse;
                let request:any = null;

                switch (envResponse.env) {
                    case 'prod': {
                        request = this.http.get('assets/conf/config.' + envResponse.env + '.json');
                    } break;

                    case 'dev': {
                        request = this.http.get('assets/conf/config.' + envResponse.env + '.json');
                    } break;

                    case 'default': {
                        console.error('env is not explicity setted, loaded default one: dev');
                        request = this.http.get('assets/conf/config.default.json');
                    } break;
                }

                if (request) {
                    request
                        .map( res => res.json() )
                        .catch((error: any) => {
                            console.error('Error reading ' + envResponse.env + ' configuration file');
                            resolve(error);
                            return Observable.throw(error.json().error || 'Server error');
                        })
                        .subscribe((responseData) => {
                            this.config = responseData;
                            resolve(true);
                        });
                } else {
                    console.error('Env config file "env.json" is not valid');
                    resolve(true);
                }
            });

        });
    }

    readIsPrivacyAccepted(): Promise<String> {
        return this.storage.get("isPrivacyAccepted").then(flag => { return flag });
    }
}
