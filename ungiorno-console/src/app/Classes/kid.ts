import { Service } from './service';
import { Parent } from "./parent";
import { Bus } from "./bus";
import { Delega } from "./delega";
import { Person } from "./person";
import { Group } from "./group";
import { BusService } from "./busService";
import moment from 'moment';

export class Kid extends Person {
    gender: string;
    nascita : Date;
    nascitaStr: string;
    image:string; //path?
    section: string;
    parent1: Parent;
    parent2: Parent;
    bus: BusService;
    ritiro: Person[];
    deleghe: Delega[];
    allergie: string[];
    sperimentazione : boolean;
    services : Service[];


    constructor(id:string, name:string, surname:string, gender?:string, nascita?:Date, image?:string, 
                section?: string, parent1?:Parent, parent2?:Parent, bus?:BusService, ritiro?:Person[], deleghe?: Delega[], allergie?:string[], sperimentazione? : boolean, services?:Service[]) {
                    super(id, name, surname);
                    this.gender = gender || "";
                    this.nascita = nascita ? new Date(nascita) : null;
                    this.nascitaStr = this.nascita instanceof Date ? moment(this.nascita).format('YYYY-MM-DD') : "";
                    this.image = image  || "";
                    this.section = section || "";
                    this.parent1 = parent1 || new Parent('', '', '');
                    this.parent2 = parent2 || new Parent('', '', '');
                    this.bus = bus || new BusService();
                    this.ritiro = ritiro || [];
                    this.deleghe = deleghe || [];
                    this.allergie = allergie || [];
                    this.sperimentazione = sperimentazione || false;
                    this.services = services || [];
    }
}
