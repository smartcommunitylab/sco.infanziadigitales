export class Person {
    id: string;
    name: string;
    surname: string;
    phoneNumbers : string[];
    emails : string[];
    cellphone: string;
    telephone: string;
    

    constructor(id:string, name:string, surname:string, phoneNumbers?: string[], emails?:string[]) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.phoneNumbers = phoneNumbers || [];
        this.emails = emails || [];
    }
}
