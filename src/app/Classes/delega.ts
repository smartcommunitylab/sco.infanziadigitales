import { Person } from "./person";

export class Delega extends Person {
    legame: string;
    scadenza:Date;
    maggiorenne:boolean;

    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string, legame?:string, scadenza?:Date, maggiorenne?:boolean) {
        super(id, name, surname, cellphone, telephone, email);
        this.legame = legame;
        this.scadenza = scadenza;
        this.maggiorenne = maggiorenne;
    }
}
