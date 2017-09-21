import { Component } from '@angular/core';
import { Person } from "./person";
import { Group } from "./group";

export class Teacher extends Person {
    pin: string;

    constructor(id:string, name:string, surname:string, pin:string, phoneNumbers?:string[], email?:string) {
        let emails : string[] = [];
        if(email) {
            emails.push(email);
        }
        super(id, name, surname, phoneNumbers, emails);
        this.pin = pin || "";
    }
}