import { Component } from '@angular/core';
import { Person } from "./person";

export class Parent extends Person {
    
    constructor(id:string, name:string, surname:string, cellphone?:string, telephone?:string, email?:string) {
        super(id, name, surname, cellphone, telephone, email);
    }
}
