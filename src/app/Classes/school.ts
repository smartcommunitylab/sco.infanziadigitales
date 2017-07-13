import { Kid } from "./kid";
import { Teacher } from "./teacher";
import { Bus } from "./bus";
import { Service } from "./service";
import { Group } from "./group";

export class School {
    id: string;
    name: string;
    telephone: string;
    email: string;
    address: string;
    servizi: Service[];
    kids: Kid[];
    teachers: Teacher[];
    buses: Bus[];
    sections: string[];
    assenze:string[];
    groups: Group[];

    constructor() {}

    // constructor(name?:string, telephone?:string, email?:string, address?:string, kids?:Kid[], teachers?:Teacher[], buses?:Bus[]) {
    //     this.name = name;
    //     this.telephone = telephone;
    //     this.email = email;
    //     this.address = address;
    //     this.kids = kids;
    //     this.teachers = teachers;
    //     this.buses = buses;
    // }
}