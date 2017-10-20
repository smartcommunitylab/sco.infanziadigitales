import { Kid } from "./kid";
import { Teacher } from "./teacher";
import { Bus } from "./bus";
import { Service } from "./service";
import { Group } from "./group";

export class School {
    id: string;
    appId:string;
    name: string;
    phoneNumbers: string[];
    email: string;
    address: string;
    servizi: Service[];
    kids: Kid[];
    teachers: Teacher[];
    buses: Bus[];
    assenze:string[];
    malattie: string[];
    groups: Group[];
    fermate : string[];
    malattia : boolean;
    familiari : boolean;
    accessEmail: string;

    constructor() {
        this.phoneNumbers = [];
        this.servizi = [];
        this.kids = [];
        this.teachers = [];
        this.buses = [];
        this.assenze = [];
        this.malattie = [];
        this.groups = [];
        this.fermate = [];
    }
}