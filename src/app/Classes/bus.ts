import { Component } from '@angular/core';

@Component({
  
})

export class Bus {
    id: string;
    capolinea: string;

    constructor(id:string, capolinea:string) {
        this.id = id;
        this.capolinea = capolinea;
    }
}
