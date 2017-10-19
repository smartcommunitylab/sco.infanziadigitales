import { Stop } from './stop'
export class BusService {
    enabled:boolean;
    stops: Stop[];
    busId : string;

    constructor() {
        this.enabled=false;
        this.stops = [];
        this.busId = "";
    }
}
