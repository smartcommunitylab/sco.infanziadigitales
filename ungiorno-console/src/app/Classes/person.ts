export class Person {
    id: string;
    name: string;
    surname: string;
    phoneNumbers : string[];
    cellphone: string;
    telephone: string;
    email: string;
    

    constructor(id:string, name:string, surname:string, phoneNumbers?: string[], email?:string) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.phoneNumbers = phoneNumbers || [];
        this.email = email || "";
    }
}
