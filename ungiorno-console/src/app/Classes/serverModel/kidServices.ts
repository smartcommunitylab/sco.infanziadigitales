
import { ServerServiceData } from "./serverServiceData";

export class KidServices {
    anticipo : any; //deprecated data
    posticipo : any; //deprecated data
    mensa : any;
    bus : any;
    timeSlotServices: ServerServiceData[];


    constructor() {
        this.timeSlotServices = [];
    }
}