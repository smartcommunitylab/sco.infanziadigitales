import { Component } from '@angular/core';
import { Person } from "./person";
import { Group } from "./group";

export class Teacher extends Person {
    // groups_sections : Group[];
    pin: string;

    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string, pin?:string) {
        super(id, name, surname, cellphone, telephone, email);
        // this.groups_sections = section;
        this.pin = pin;
    }
}