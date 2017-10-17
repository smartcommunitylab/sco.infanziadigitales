export class ServerSection {
    sectionId : string;
    name : string;
    group : boolean;

    constructor(name:string, group: boolean) {
        this.sectionId = name;
        this.name = name;
        this.group = group;
    }


    // private String sectionId, name;
    // private boolean group;

}