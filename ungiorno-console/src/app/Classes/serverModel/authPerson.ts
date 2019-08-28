export class AuthPerson {
    personId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    relation: string;
    authorizationUrl: string;
    phone: string[];
    email: string[];
    authorizationDeadline: Number;
    adult: boolean;
    parent: boolean;
    _default: boolean;

    constructor() {
        this.phone = [];
        this.email = [];
    }
}