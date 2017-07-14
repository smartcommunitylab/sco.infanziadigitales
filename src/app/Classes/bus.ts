import { Kid } from './kid';
export class Bus {
    name: string;
    capolinea: string;
    kids : Kid[];

    constructor(id:string, capolinea:string, kids : Kid[]) {
        this.name = id;
        this.capolinea = capolinea;
        this.kids = kids;
    }
}
