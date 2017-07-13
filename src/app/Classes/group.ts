import { Kid } from './kid';
import { Teacher } from "./teacher";

export class Group {
    name: string;
    kids: Kid[];
    section: boolean;
    teachers: Teacher[];

    constructor(name:string, kids: Kid[], section: boolean, teachers: Teacher[]) {
        this.name = name;
        this.kids = kids;
        this.section = section;
        this.teachers = teachers;
    }
}
