export class Person {
    id: string;
    name: string;
    surname: string;
    cellphone: string;
    telephone: string;
    email: string;
    

    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.cellphone = cellphone || "";
        this.telephone = telephone || "";
        this.email = email || "";
    }
}
