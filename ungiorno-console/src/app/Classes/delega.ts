import { Person } from "./person";

export class Delega extends Person {
    legame: string;
    scadenza:Date;
    scadenzaStr: string;
    maggiorenne:boolean;

    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string, legame?:string, scadenza?:Date, maggiorenne?:boolean) {
        super(id, name, surname, cellphone, telephone, email);
        this.legame = legame || "";
        this.scadenza = scadenza || new Date();
        this.scadenzaStr = this.scadenza.toISOString().substring(0,10);
        this.maggiorenne = maggiorenne || false;
    }
}
