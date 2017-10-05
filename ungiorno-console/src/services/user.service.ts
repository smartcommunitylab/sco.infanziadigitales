import { Injectable } from '@angular/core'
//import {WebAPIConnectorService} from './webAPIConnector.service';

@Injectable()
export class UserService {
    private userId: string;

    //   constructor(private webAPIConnector: WebAPIConnectorService, private config: ConfigService) {
    //   };
    constructor() {
    }

    getUserId(): string {
        return this.userId;
    }
    setUserId(newId: string) {
        this.userId = newId;
    }
}
