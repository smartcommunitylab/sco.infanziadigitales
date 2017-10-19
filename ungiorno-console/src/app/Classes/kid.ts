import { Service } from './service';
import { Parent } from "./parent";
import { Bus } from "./bus";
import { Delega } from "./delega";
import { Person } from "./person";
import { Group } from "./group";

export class Kid extends Person {
    gender: string;
    nascita : Date;
    nascitaStr: string;
    image:string; //path?
    section: boolean;
    parent1: Parent;
    parent2: Parent;
    bus: Bus;
    ritiro: Person[];
    deleghe: Delega[];
    allergie: string[];
    sperimentazione : boolean;
    services : Service[];

    // get Nascita():string {
    //     return new Date(this.nascita).toLocaleDateString();
    // }

    constructor(id:string, name:string, surname:string, gender?:string, nascita?:Date, image?:string, 
                section?: boolean, parent1?:Parent, parent2?:Parent, bus?:Bus, ritiro?:Person[], deleghe?: Delega[], allergie?:string[], sperimentazione? : boolean, services?:Service[]) {
                    super(id, name, surname);
                    this.gender = gender || "";
                    this.nascita = nascita ? new Date(nascita) : null;
                    this.nascitaStr = this.nascita instanceof Date ? this.nascita.toISOString().substring(0,10) : "";
                    this.image = image  || "";
                    this.section = section || false;
                    this.parent1 = parent1 || new Parent('', '', '');
                    this.parent2 = parent2 || new Parent('', '', '');
                    this.bus = bus || new Bus('');
                    this.ritiro = ritiro || [];
                    this.deleghe = deleghe || [];
                    this.allergie = allergie || [];
                    this.sperimentazione = sperimentazione || false;
                    this.services = services || [];
    }
}
