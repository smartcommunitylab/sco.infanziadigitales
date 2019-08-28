import { ServiceTimeSlot } from "./serviceTimeSlot";

export class ServerServiceData {
   name: string;
   regular: boolean;
   enabled: boolean;
   timeSlots: ServiceTimeSlot[];
   
    constructor() {
    }
}