import { Kid } from './kid';

export class Group {
    name: string;
    kids: Kid[];

    constructor(name:string, kids: Kid[]) {
        this.name = name;
        this.kids = kids;
    }
}
