import { Service } from './service';
import { Parent } from "./parent";
import { Bus } from "./bus";
import { Delega } from "./delega";
import { Person } from "./person";
import { Group } from "./group";

export class Kid extends Person {
    gender: string;
    nascita : Date;
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

    constructor(id:string, name:string, surname:string, gender?:string, nascita?:Date, image?:string, 
                section?: boolean, parent1?:Parent, parent2?:Parent, bus?:Bus, ritiro?:Person[], deleghe?: Delega[], allergie?:string[], sperimentazione? : boolean, services?:Service[]) {
                    super(id, name, surname);
                    this.gender = gender;
                    this.nascita = nascita;
                    this.image = image;
                    this.section = section;
                    this.parent1 = parent1;
                    this.parent2 = parent2;
                    this.bus = bus;
                    this.ritiro = ritiro;
                    this.deleghe = deleghe;
                    this.allergie = allergie;
                    this.sperimentazione = sperimentazione;
                    this.services = services;
    }
}
