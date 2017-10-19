import { Kid } from './kid';
export class Bus {
    busId:string;
    name: string;
    capacity : number;

    constructor(id:string) {
        this.busId=id;
        this.name = id;
        this.capacity = 0;
    }
}
