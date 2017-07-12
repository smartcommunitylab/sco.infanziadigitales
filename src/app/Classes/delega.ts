import { Person } from "./person";

export class Delega extends Person {
    legame: string;

    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string, legame?:string) {
        super(id, name, surname, cellphone, telephone, email);
        this.legame = legame;
    }
}
