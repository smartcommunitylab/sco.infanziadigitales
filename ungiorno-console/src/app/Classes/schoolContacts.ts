export class SchoolContacts {
    telephone: string[];
    email: string[];

    constructor(telephone? : string[],email? : string[] ) {
        this.telephone = telephone === undefined ? [] : telephone;
        this.email = email === undefined ? [] : email;
    }

    addTelephone(telephone : string) {
        this.telephone.push(telephone);
    }

    addEmail(email : string) {
        this.email.push(email);
    }
}