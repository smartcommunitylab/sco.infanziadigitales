import { Injectable } from '@angular/core'
import { School } from "../app/Classes/school";


@Injectable()
export class UserService {
    private userId: string;
    private authorizedSchools : School[];

    constructor() {
    }

    getUserId(): string {
        return this.userId;
    }
    setUserId(newId: string) {
        this.userId = newId;
    }

    getAuthorizedSchools() : School[] {
        return this.authorizedSchools;
    }

    setAuthorizedSchools(schools : School[]) {
        this.authorizedSchools = schools;
    }
}
