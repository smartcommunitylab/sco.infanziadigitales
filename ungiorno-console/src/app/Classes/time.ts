export class Time {
    name: string;
    start: string;
    end: string

    constructor(name:string, start?: Date, end?: Date) {
        this.name = name.charAt(0).toUpperCase() + name.slice(1) || "";
        this.start = start.toLocaleTimeString("it").substring(0,5) || "";
        this.end = end.toLocaleTimeString("it").substring(0,5) || "";
    }
}