import { Parent } from "./parent";
import { Bus } from "./bus";
import { Delega } from "./delega";
import { Person } from "./person";
import { Group } from "./group";

export class Kid extends Person {
    image:string; //path?
    section: boolean;
    parent1: Parent;
    parent2: Parent;
    anticipo: boolean;
    posticipo: boolean;
    mensa: boolean;
    bus: Bus;
    ritiro: Person[];
    deleghe: Delega[];
    allergie: string[];

    constructor(id:string, name:string, surname:string, image?:string, 
                section?: boolean, parent1?:Parent, parent2?:Parent, anticipo?:boolean, 
                posticipo?:boolean, mensa?:boolean, bus?:Bus, ritiro?:Delega[], allergie?:string[]) {
                    super(id, name, surname);
                    this.image = image;
                    this.section = section;
                    this.parent1 = parent1;
                    this.parent2 = parent2;
                    this.anticipo = anticipo;
                    this.posticipo = posticipo;
                    this.mensa = mensa;
                    this.bus = bus;
                    this.ritiro = ritiro;
                    this.allergie = allergie;
    }
}
