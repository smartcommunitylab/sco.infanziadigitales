import { Kid } from './kid';
import { Time } from "./time";

export class Service {
    servizio: string;
    fasce: Time[];
    normale  :boolean;

    constructor(name:string, fasce: Time[], normale?:boolean) {
        this.servizio = name.charAt(0).toUpperCase() + name.slice(1);
        this.fasce = fasce;
        this.normale = normale || false;
    }
}