import { Component } from '@angular/core';
import { Person } from "./person";
import { Group } from "./group";

export class Teacher extends Person {
    // groups_sections : Group[];
    pin: string;

    constructor(id:string, name:string, surname:string, pin:string, cellphone?:string, telephone?:string, email?:string) {
        let phones : string[] = [];
        if(cellphone) {
            phones.push(cellphone);
        }
        if(telephone) {
            phones.push(telephone);
        }
        super(id, name, surname, phones, email);
        // this.groups_sections = section;
        this.pin = pin || "";
    }
}