import { Service } from './Classes/service';
import { Group } from './Classes/group';
import { Bus } from './Classes/bus';
import { Parent } from './Classes/parent';
import { Teacher } from './Classes/teacher';
import { Kid } from "./Classes/kid";
import { SchoolContacts } from "./Classes/schoolContacts"

import { ServerSchoolData } from './Classes/serverModel/serverSchoolData';
import { ServerTeacherData } from './Classes/serverModel/serverTeacherData';
import { ServerKidData } from './Classes/serverModel/serverKidData';
import { AuthPerson } from './Classes/serverModel/authPerson';
import { KidServices } from './Classes/serverModel/kidServices';
import { Allergy } from './Classes/serverModel/allergy';

import { Injectable }    from '@angular/core';
import { Http, Headers } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { School } from "./Classes/school";

@Injectable()
export class WebService {
  private schoolUrl = 'http://localhost:8080/ungiorno2/consoleweb/testApp'
  private headers = new Headers({'Content-Type': 'application/json'});

  private appId = 'testApp';
  private schoolId = '';
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
     return this.http.get(`http://localhost:8080/ungiorno2/school/${this.appId}/${id}/profile`)
    .toPromise()
    .then(response => {
      let serverSchoolData = response.json().data as ServerSchoolData;
      return this.convertToSchool(serverSchoolData);
    })
    .catch(this.handleError);
  }

  getKid(schoolId: string, kidId : string): Promise<Kid> {
    const url = `${this.schoolUrl}/${schoolId}`;
    return this.getSchool(schoolId).then(tmp => {
      return tmp.kids.find(x=>x.id.toLowerCase() == kidId.toLowerCase());
    });
  }

  getKids(schoolId: string): Promise<Kid[]> {
    return this.http.get(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/kid`).toPromise().then(response => response.json().data.map(serverKid => this.convertToKid(serverKid))).catch(this.handleError);
  }
    
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  private addTeacher(schoolId : string, teacherProfile : Teacher) : Promise<Teacher> {
    let convertedTeacher: ServerTeacherData = this.convertToServerTeacher(teacherProfile);
    return this.http.post(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/teacher`,convertedTeacher).toPromise().then(
      response => this.convertToTeacher(response.json().data)
  ).catch(this.handleError);
  }

  private addKid(schoolId: string, kidProfile: Kid) : Promise<Kid> {
    let convertedKid : ServerKidData = this.convertToServerKid(kidProfile);
    return this.http.post(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/kid`,convertedKid).toPromise().then(
      response => this.convertToKid(response.json().data)
  ).catch(this.handleError);
  }

  getTeachers(schoolId: string) : Promise<Teacher[]> {
    return this.http.get(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/teacher`).toPromise().then(
      response => response.json().data.map(serverTeacher => this.convertToTeacher(serverTeacher))
    ).catch(this.handleError);
  }
  

  private removeTeacher(schoolId : string, teacherId : string) : Promise<Teacher> {
    return this.http.delete(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/teacher/${teacherId}`).toPromise().then(
      response => this.convertToTeacher(response.json().data)
  ).catch(this.handleError);
  }

  private removeKid(schoolId : string, kidId : string) : Promise<Kid> {
    return this.http.delete(`http://localhost:8080/ungiorno2/consoleweb/${this.appId}/${schoolId}/kid/${kidId}`).toPromise().then(
      response => this.convertToKid(response.json().data)
  ).catch(this.handleError);
  }

  add(schoolId: string, item : any) : Promise<any> {
    var sch;
    const url = `${this.schoolUrl}/${schoolId}`
    if (item instanceof Teacher) {
      // return this.getSchool(schoolId).then(tmp => {
      //   tmp.teachers.push(item); 
      //   return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      // });
      return this.addTeacher(schoolId, item);
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
      // return this.getSchool(schoolId).then(tmp => {
      //   tmp.kids.push(item); 
      //   return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      // });
      return this.addKid(schoolId, item);
    }
    else if(item instanceof Service) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.servizi.push(item); 
        return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
  }

  remove(schoolId: string, item: any) : Promise<any> {
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
      // return this.getSchool(schoolId).then(tmp => {
      //   var pos = tmp.teachers.findIndex(x => x.id === item.id)
      //   tmp.teachers.splice(pos, 1); 
      //   return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      // });
      return this.removeTeacher(schoolId,item.id);
    }
    else if(item instanceof Kid) {
      // return this.getSchool(schoolId).then(tmp => {
      //   var pos = tmp.kids.findIndex(x => x.id === item.id)
      //   tmp.kids.splice(pos, 1); 
      //   return this.http.put(url, JSON.stringify(tmp), {headers: this.headers}).toPromise().then(() => tmp).catch(this.handleError);
      // });
      return this.removeKid(schoolId,item.id);
    }
  }

  update(school : School) {
    const url = `${this.schoolUrl}/${school.id}`;
    let convertedSchool = this.convertToServerSchool(school);
    return this.http
    .put(url, JSON.stringify(convertedSchool), {headers: this.headers})
    .toPromise()
    .then(() => school)
    .catch(this.handleError);
  }

  private convertToTeacher = function(serverTeacherData : ServerTeacherData) : Teacher {
    let teacher = new Teacher(serverTeacherData.teacherId,serverTeacherData.teacherName,serverTeacherData.teacherSurname,serverTeacherData.pin,'NOT SUPPORTED BY SERVER','NOT SUPPORTED BY SERVER',serverTeacherData.username);
    return teacher;
  }

  private convertToServerTeacher = function(teacher : Teacher) : ServerTeacherData {
    let convertedTeacher = new ServerTeacherData();
    convertedTeacher.pin = teacher.pin;
    convertedTeacher.teacherFullname = `${teacher.name} ${teacher.surname}`;
    convertedTeacher.teacherName = teacher.name;
    convertedTeacher.teacherSurname = teacher.surname;
    convertedTeacher.teacherId = teacher.id;
    convertedTeacher.sectionIds = [];
    return convertedTeacher;
  }

  private convertToKid = function(serverKidData : ServerKidData) : Kid {
    let allergies  = serverKidData.allergies ? serverKidData.allergies.map(allergy => allergy.name) : null;
    let convertedKid = new Kid(serverKidData.kidId,serverKidData.firstName,serverKidData.lastName,null,null,serverKidData.image,null,null,null,null,null,null,allergies,null,null);
    let parents = serverKidData.persons.filter(person => person.parent);
    if(parents.length > 0) {
      convertedKid.parent1 = this.convertToParent(parents[0]);
      convertedKid.parent2 = parents.length == 2 ? this.convertToParent(parents[1]) : null;
    }
    return convertedKid;
  }

  private convertToServerKid = function(kid : Kid) : ServerKidData {
    let convertedKid = new ServerKidData();
    convertedKid.kidId = kid.id;
    convertedKid.firstName = kid.name;
    convertedKid.lastName = kid.surname;
    convertedKid.persons = [];
    convertedKid.services = new KidServices();

    convertedKid.allergies = kid.allergie.map(allergy => new Allergy(allergy,allergy));
    if(kid.parent1) {
     convertedKid.persons.push(this.convertToAuthPerson(kid.parent1));
    }
    if(kid.parent2) {
      convertedKid.persons.push(this.convertToAuthPerson(kid.parent2));
     }

    return convertedKid;
  }

  private convertToAuthPerson = function(parent : Parent) : AuthPerson {
    let convertedParent = new AuthPerson();
    convertedParent.personId = parent.id;
    convertedParent.email.push(parent.email);
    if(parent.cellphone) {
      convertedParent.phone.push(parent.cellphone);
    }
    if(parent.telephone) {
      convertedParent.phone.push(parent.telephone);
    }
    convertedParent.firstName = parent.name;
    convertedParent.lastName =  parent.surname;
    convertedParent.fullName = `${convertedParent.firstName} ${convertedParent.lastName}`;
    convertedParent.parent = true;
    return convertedParent;
  }

  private convertToParent = function(authPerson : AuthPerson) : Parent {
    let cellphone = authPerson.phone ? authPerson.phone[0] : null;
    let email = authPerson.email ? authPerson.email[0] : null;
    let parent = new Parent(authPerson.personId,authPerson.firstName,authPerson.lastName,cellphone, null, email);

    return parent;
  }
 
  private convertToSchool = function(serverSchoolData : ServerSchoolData) : School {
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
    
    
    // DA TOGLIERE
    school.teachers = [];
    school.servizi = [];
    school.groups = [];
    //school.buses = serverSchoolData.buses;

    
    // MODELLO CLIENT
    // servizi: Service[];
    // kids: Kid[];
    // teachers: Teacher[];
    // buses: Bus[];
    
    // groups: Group[];
    // fermate : string[];
    

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

  private convertToServerSchool = function (school : School) : ServerSchoolData {
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