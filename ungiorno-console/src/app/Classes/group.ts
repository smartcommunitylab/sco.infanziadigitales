import { Kid } from './kid';
import { Teacher } from "./teacher";

export class Group {
    name: string;
    kids: string[];
    section: boolean;
    teachers: string[];

    constructor(name:string, kids: string[], section: boolean, teachers: string[]) {
        this.name = name;
        this.kids = kids == null ? [] : kids;
        this.section = section;
        this.teachers = teachers == null ? [] : teachers;
    }
}
