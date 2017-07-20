import { Kid } from './kid';
export class Bus {
    name: string;
    capolinea: string;
    kids : string[];

    constructor(id:string, capolinea:string, kids?: string[]) {
        this.name = id;
        this.capolinea = capolinea;
        this.kids = kids || [];
    }
}
