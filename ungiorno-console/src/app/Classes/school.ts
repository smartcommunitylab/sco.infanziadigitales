import { Kid } from "./kid";
import { Teacher } from "./teacher";
import { Bus } from "./bus";
import { Service } from "./service";
import { Group } from "./group";

export class School {
    id: string;
    appId: string;
    name: string;
    phoneNumbers: string[];
    email: string;
    address: string;
    servizi: Service[];
    kids: Kid[];
    teachers: Teacher[];
    buses: Bus[];
    assenze: string[];
    malattie: string[];
    groups: Group[];
    fermate: string[];
    malattia: boolean;
    familiari: boolean;
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

    static copy(source: School): School {
        let school = new School();
        school.copyInto(source);
        return school;
    }

    copyInto(source: any) {
        Object.assign(this, source)
        this.phoneNumbers = new Array();
        if (source.phoneNumbers)
            source.phoneNumbers.forEach(x => this.phoneNumbers.push(x));
        this.servizi = new Array();
        if (source.servizi)
            source.servizi.forEach(x => this.servizi.push(x));
        this.kids = new Array();
        if (source.kids)
            source.kids.forEach(x => this.kids.push(x));
        this.teachers = new Array();
        if (source.teacher)
            source.teachers.forEach(x => this.teachers.push(x));
        this.buses = new Array();
        if (source.buses)
            source.buses.forEach(x => this.buses.push(x));
        this.assenze = new Array();
        if (source.assenze)
            source.assenze.forEach(x => this.assenze.push(x));
        this.malattie = new Array();
        if (source.malattie)
            source.malattie.forEach(x => this.malattie.push(x));
        this.groups = new Array();
        if (source.groups)
            source.groups.forEach(x => this.groups.push(x));
        this.fermate = new Array();
        if (source.fermate)
            source.fermate.forEach(x => this.fermate.push(x));

    }
}