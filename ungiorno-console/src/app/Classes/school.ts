import { Kid } from "./kid";
import { Teacher } from "./teacher";
import { Bus } from "./bus";
import { Service } from "./service";
import { Group } from "./group";

export class School {
    id: string;
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

    constructor() {
        this.phoneNumbers = [];
    }
}