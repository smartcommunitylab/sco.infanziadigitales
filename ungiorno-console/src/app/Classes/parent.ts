import { Component } from '@angular/core';
import { Person } from "./person";

export class Parent extends Person {
    
    constructor(id:string, name:string, surname:string, phoneNumbers? : string[], email?:string) {
        super(id, name, surname, phoneNumbers, email);
    }
}
