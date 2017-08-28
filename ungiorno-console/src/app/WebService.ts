import { Service } from './Classes/service';
import { Group } from './Classes/group';
import { Bus } from './Classes/bus';
import { Parent } from './Classes/parent';
import { Teacher } from './Classes/teacher';
import { Kid } from "./Classes/kid";
import { SchoolContacts} from "./Classes/schoolContacts"

import { ServerSchoolData } from './Classes/serverModel/serverSchoolData';

import { Injectable }    from '@angular/core';
import { Http, Headers } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { School } from "./Classes/school";

@Injectable()
export class WebService {
  private schoolUrl = 'http://localhost:8080/ungiorno2/consoleweb/testApp'
  private headers = new Headers({'Content-Type': 'application/json'});

  school : School;
  
  constructor(private http : Http) {}

  getData(): Promise<School[]> {
    return this.http.get('http://localhost:8080/ungiorno2/consoleweb/testApp/me').toPromise().then(x => {
      let serverSchoolsData = x.json().data;
      serverSchoolsData.forEach(data => {
        data.id = data.schoolId;
      });
      return  serverSchoolsData as School[]
    })
  }

  getSchool(id: string) : Promise<School> {
    const url = `${this.schoolUrl}/${id}`;
     return this.http.get(`http://localhost:8080/ungiorno2/school/testApp/${id}/profile`)
    .toPromise()
    .then(response => {
      let serverSchoolData = response.json().data as ServerSchoolData;
      return this.convertToConsoleStructure(serverSchoolData);
    })
    .catch(this.handleError);
  }

  getKid(schoolId: string, kidId : string): Promise<Kid> {
    const url = `${this.schoolUrl}/${schoolId}`;
    return this.getSchool(schoolId).then(tmp => {
      return tmp.kids.find(x=>x.id.toLowerCase() == kidId.toLowerCase());
    });
  }
    
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  add(schoolId: string, item : any) : Promise<School> {
    var sch;
    const url = `${this.schoolUrl}/${schoolId}`
    if (item instanceof Teacher) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.teachers.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Bus) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.buses.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Group) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.groups.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if(item instanceof Kid) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.kids.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if(item instanceof Service) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.servizi.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
  }

  remove(schoolId: string, item: any) : Promise<School> {
    const url = `${this.schoolUrl}/${schoolId}`;
    if (item instanceof Group) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.groups.findIndex(x => x.name === item.name)
        tmp.groups.splice(pos, 1); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if(item instanceof Bus) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.buses.findIndex(x => x.name === item.name)
        tmp.buses.splice(pos, 1); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if(item instanceof Teacher) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.teachers.findIndex(x => x.id === item.id)
        tmp.teachers.splice(pos, 1); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if(item instanceof Kid) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.kids.findIndex(x => x.id === item.id)
        tmp.kids.splice(pos, 1); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
  }

  update(school : School) {
    const url = `${this.schoolUrl}/${school.id}`;
    let convertedSchool = this.convertToServerStructure(school);
    return this.http
    .put(url, JSON.stringify(convertedSchool), {headers: this.headers})
    .toPromise()
    .then(() => school)
    .catch(this.handleError);
  }

  private convertToConsoleStructure = function(serverSchoolData : ServerSchoolData) : School {
    let school = new School();
    school.id = serverSchoolData.schoolId;
    school.email = serverSchoolData.contacts && serverSchoolData.contacts.email.length > 0 ? serverSchoolData.contacts.email[0] : "";
    school.telephone = serverSchoolData.contacts && serverSchoolData.contacts.telephone.length > 0 ? serverSchoolData.contacts.telephone[0] : "";
    school.name = serverSchoolData.name;
    school.address = "NOT SUPPORTED BY SERVER";

    school.assenze = serverSchoolData.absenceTypes ? serverSchoolData.absenceTypes.map(typeDef => typeDef.type) : [];
    school.malattie = serverSchoolData.frequentIllnesses ? serverSchoolData.frequentIllnesses.map(typeDef => typeDef.type) : [];

    // malattia is managed only as checkbox, but server side it is considered an absenceType
    // so I've to transform data to mantain difference from UI data and backend model representation
    school.malattia = school.assenze.indexOf(ServerSchoolData.ILLNESS_VALUE) >= 0;
    school.familiari = school.assenze.indexOf(ServerSchoolData.FAMILY_MOTIVATION_VALUE) >= 0;
    school.assenze = school.assenze.filter(absenceType => absenceType !== ServerSchoolData.ILLNESS_VALUE && absenceType !== ServerSchoolData.FAMILY_MOTIVATION_VALUE);
    //school.buses = serverSchoolData.buses;

    
    // MODELLO CLIENT
    // servizi: Service[];
    // kids: Kid[];
    // teachers: Teacher[];
    // buses: Bus[];
    // assenze:string[];
    // malattie: string[];
    // groups: Group[];
    // fermate : string[];
    // malattia : boolean;
    // familiari : boolean;

  // MODELLO SERVER
  // private Timing regularTiming, anticipoTiming, posticipoTiming;
  // private List<TypeDef> absenceTypes;
  // private List<TypeDef> frequentIllnesses;
  // private List<TypeDef> teacherNoteTypes;
  // private List<TypeDef> foodTypes;
  // private List<SectionProfile> sections;
  // private List<BusProfile> buses;
  // private String absenceTiming, retireTiming;
  // private String accessEmail;

    return school;
  }

  private convertToServerStructure = function (school : School) : ServerSchoolData {
    let convertedSchool = new ServerSchoolData();
    convertedSchool.schoolId = school.id;
    convertedSchool.name = school.name;
    convertedSchool.contacts = new SchoolContacts();
    convertedSchool.contacts.addTelephone(school.telephone);
    convertedSchool.contacts.addEmail(school.email);
    if(school.assenze) {
      convertedSchool.absenceTypes = [];
      school.assenze.forEach(function(absence) {
        convertedSchool.absenceTypes.push({typeId: absence, type: absence});
      });

      if(school.malattia) {
        convertedSchool.absenceTypes.push({typeId : ServerSchoolData.ILLNESS_VALUE, type : ServerSchoolData.ILLNESS_VALUE}); 
      } else {
        let illnesIndex = convertedSchool.absenceTypes.findIndex(typedef => typedef.type === ServerSchoolData.ILLNESS_VALUE);
        if(illnesIndex >= 0) {
          convertedSchool.absenceTypes.splice(illnesIndex,1);
        }
      }

      if(school.familiari) {
        convertedSchool.absenceTypes.push({typeId : ServerSchoolData.FAMILY_MOTIVATION_VALUE, type : ServerSchoolData.FAMILY_MOTIVATION_VALUE}); 
      } else {
        let familiarIndex = convertedSchool.absenceTypes.findIndex(typedef => typedef.type === ServerSchoolData.FAMILY_MOTIVATION_VALUE);
        if(familiarIndex >= 0) {
          convertedSchool.absenceTypes.splice(familiarIndex,1);
        }
      }
    }
    
    if(school.malattie) {
      convertedSchool.frequentIllnesses = [];
      school.malattie.forEach(function(absence) {
        convertedSchool.frequentIllnesses.push({typeId: absence, type: absence});
      });
    }
    return convertedSchool;


    // private Timing regularTiming, anticipoTiming, posticipoTiming;
    // private Contact contacts;
    // private List<TypeDef> absenceTypes;
    // private List<TypeDef> frequentIllnesses;
    // private List<TypeDef> teacherNoteTypes;
    // private List<TypeDef> foodTypes;
    // private List<SectionProfile> sections;
    // private List<BusProfile> buses;
    // private String absenceTiming, retireTiming;
    // private String accessEmail;
  }
}