import { Service } from './../app/Classes/service';
import { Group } from './../app/Classes/group';
import { Bus } from './../app/Classes/bus';
import { Parent } from './../app/Classes/parent';
import { Teacher } from './../app/Classes/teacher';
import { Kid } from "./../app/Classes/kid";
import { SchoolContacts } from "./../app/Classes/schoolContacts"
import { Time } from "./../app/Classes/time"

import { ServerSchoolData } from './../app/Classes/serverModel/serverSchoolData';
import { ServerTeacherData } from './../app/Classes/serverModel/serverTeacherData';
import { ServerKidData } from './../app/Classes/serverModel/serverKidData';
import { AuthPerson } from './../app/Classes/serverModel/authPerson';
import { KidServices } from './../app/Classes/serverModel/kidServices';
import { Allergy } from './../app/Classes/serverModel/allergy';
import { Delega } from './../app/Classes/delega'

import { Injectable } from '@angular/core';
import { Http, Headers, BaseRequestOptions, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { School } from "./../app/Classes/school";
import { ServerServiceData } from "./../app/Classes/serverModel/serverServiceData";
import { ServiceTimeSlot } from "./../app/Classes/serverModel/serviceTimeSlot";

import { ConfigService } from "../services/config.service"

import moment from 'moment';
import { UserService } from "../services/user.service";
import { ServerSection } from "../app/Classes/serverModel/serverSection";
import { FileUploader } from 'ng2-file-upload';

@Injectable()
export class DefaultRequestOptions extends BaseRequestOptions {

  constructor() {
    super();
    this.headers.set('Accept', 'application/json');
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('Authorization', `Bearer ${sessionStorage.getItem('access_token')}`);
  }
}

export const requestOptionsProvider = { provide: RequestOptions, useClass: DefaultRequestOptions };



@Injectable()
export class WebService {
  private appId = 'trento';

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private apiUrl;
  private schoolId = '';
  school: School;

  constructor(private http: Http, private configService: ConfigService) {
    this.apiUrl = configService.getConfig('apiUrl');

  }

  getProfile(): Promise<UserService> {
    let url: string = this.apiUrl + '/consoleweb/profile/me';

    return this.http.get(url)
      .toPromise()
      .then(response => {
        console.log('profile response ' + JSON.stringify(response));
        let userService = new UserService();
        userService.setUserId(response.json().data.username);
        userService.setAuthorizedSchools(response.json().data.authorizedSchools.map(rawSchool => this.convertToSchool(rawSchool)));
        console.log('logged as ' + userService.getUserId());
        return userService;
      }).catch(error => {
        console.log(error);
        return this.handleError(error);
      });
  }


  getData(): Promise<School[]> {
    return this.http.get(`${this.apiUrl}/consoleweb/${this.appId}/me`).toPromise().then(x => {
      let serverSchoolsData = x.json().data;
      serverSchoolsData.forEach(data => {
        data.id = data.schoolId;
      });
      return serverSchoolsData as School[]
    })
  }

  getSchool(id: string): Promise<School> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get(`${this.apiUrl}/consoleweb/${this.appId}/${id}/profile`)
      .toPromise()
      .then(response => {
        let serverSchoolData = response.json().data as ServerSchoolData;
        return this.convertToSchool(serverSchoolData);
      })
      .catch(this.handleError);
  }

  getKid(schoolId: string, kidId: string): Promise<Kid> {
    return this.getSchool(schoolId).then(tmp => {
      return tmp.kids.find(x => x.id.toLowerCase() == kidId.toLowerCase());
    });
  }

  getKids(schoolId: string): Promise<Kid[]> {
    return this.http.get(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/kid`).toPromise().then(response => response.json().data.map(serverKid => this.convertToKid(serverKid))).catch(this.handleError);
  }
  getImageProfileKid(schoolId: string, kidId): Promise<string> {
    return this.http.get(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/kid/${schoolId}/picture`).toPromise().then(response => response).catch(this.handleError);
  }
  addKidToGroup(school: School, kidId: string, group: Group): Promise<Kid> {
    return this.http.put(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/kid/${kidId}/group`, this.convertToServerSection(group)).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);
  }

  putKidInSection(school: School, kidId: string, section: Group): Promise<Kid> {
    return this.http.put(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/kid/${kidId}/section`, this.convertToServerSection(section)).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);
  }
  uploadDocument(uploader: FileUploader, item, selectedSchool: School, selectedKid: Kid): void {
    // https://dev.smartcommunitylab.it/ungiorno/consoleweb/trento/scuola2/kid/a/picture
    var newUrl = `${this.apiUrl}/consoleweb/${this.appId}/${selectedSchool.id}/kid/${selectedKid.id}/picture`
    console.log(newUrl);
    uploader.setOptions(
      {
        url: newUrl,
        disableMultipart: false,
        authToken: `Bearer ${sessionStorage.getItem('access_token')}`,
      }
    );
    item.withCredentials = false;

    uploader.onBuildItemForm = (item, form) => {
     // form.append("image", item);
      form.append(item.formData["image"], item);
    };
    uploader.uploadItem(item);
    uploader.onCompleteItem = (item, response, status, headers) => {
      if (status == 200) {
        console.log('upload complete for ' + item.file.name);

      }
    }
  }
  getTeachers(schoolId: string): Promise<Teacher[]> {
    return this.http.get(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/teacher`).toPromise().then(
      response => response.json().data.map(serverTeacher => this.convertToTeacher(serverTeacher))
    ).catch(this.handleError);
  }

  removeKidFromSection(school: School, kidId: string, sectionId: string): Promise<Kid> {
    return this.http.delete(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/kid/${kidId}/section/${sectionId}`).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);

  }

  removeKidFromGroup(school: School, kidId: string, groupId: string): Promise<Kid> {
    return this.http.delete(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/kid/${kidId}/group/${groupId}`).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);

  }

  addTeacherToSectionOrGroup(school: School, teacherId: string, groupId: string): Promise<Teacher> {
    return this.http.put(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/teacher/${teacherId}/section/${groupId}`, {}).toPromise().then(
      response => this.convertToTeacher(response.json().data)
    ).catch(this.handleError);
  }


  removeTeacherToSectionOrGroup(school: School, teacherId: string, groupId: string): Promise<Teacher> {
    console.log(`remove ${school.id} group ${groupId}`)
    return this.http.delete(`${this.apiUrl}/consoleweb/${this.appId}/${school.id}/teacher/${teacherId}/section/${groupId}`).toPromise().then(
      response => this.convertToTeacher(response.json().data)
    ).catch(this.handleError);
  }

  add(schoolId: string, item: any): Promise<any> {
    var sch;
    const url = `${this.apiUrl}/consoleweb/${this.appId}/${schoolId}`;
    if (item instanceof Teacher) {
      return this.addTeacher(schoolId, item);
    }
    else if (item instanceof Bus) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.buses.push(item);
        return this.http.put(url, JSON.stringify(tmp)).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Group) {
      return this.getSchool(schoolId).then(tmp => {
        tmp.groups.push(item);
        return this.http.put(url, JSON.stringify(tmp)).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Kid) {
      return this.addKid(schoolId, item);
    }
  }

  remove(schoolId: string, item: any): Promise<any> {
    const url = `${this.apiUrl}/consoleweb/${this.appId}/${schoolId}`;
    if (item instanceof Group) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.groups.findIndex(x => x.name === item.name)
        tmp.groups.splice(pos, 1);
        return this.http.put(url, JSON.stringify(tmp)).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Bus) {
      return this.getSchool(schoolId).then(tmp => {
        var pos = tmp.buses.findIndex(x => x.name === item.name)
        tmp.buses.splice(pos, 1);
        return this.http.put(url, JSON.stringify(tmp)).toPromise().then(() => tmp).catch(this.handleError);
      });
    }
    else if (item instanceof Teacher) {
      return this.removeTeacher(schoolId, item.id);
    }
    else if (item instanceof Kid) {
      return this.removeKid(schoolId, item.id);
    }
  }

  update(school: School) {
    const url = `${this.apiUrl}/consoleweb/${this.appId}/${school.id}`;
    let convertedSchool = this.convertToServerSchool(school);
    return this.http
      .put(url, JSON.stringify(convertedSchool))
      .toPromise()
      .then(() => school)
      .catch(this.handleError);
  }

  getGroup = function (schoolId: string, groupId: string): Promise<Group> {
    const url = `${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/group/${groupId}`;
    return this.http
      .get(url).toPromise().then(response => response.json().data as Group)
      .catch(this.handleError);
  }

  getGroups = function (schoolId: string): Promise<Group[]> {
    const url = `${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/group`;
    return this.http
      .get(url).toPromise().then(response => response.json().data as Group[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  private addTeacher(schoolId: string, teacherProfile: Teacher): Promise<Teacher> {
    let convertedTeacher: ServerTeacherData = this.convertToServerTeacher(teacherProfile);
    return this.http.post(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/teacher`, convertedTeacher).toPromise().then(
      response => this.convertToTeacher(response.json().data)
    ).catch(this.handleError);
  }

  private addKid(schoolId: string, kidProfile: Kid): Promise<Kid> {
    let convertedKid: ServerKidData = this.convertToServerKid(kidProfile);
    return this.http.post(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/kid`, convertedKid).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);
  }

  private removeTeacher(schoolId: string, teacherId: string): Promise<Teacher> {
    return this.http.delete(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/teacher/${teacherId}`).toPromise().then(
      response => this.convertToTeacher(response.json().data)
    ).catch(this.handleError);
  }

  private removeKid(schoolId: string, kidId: string): Promise<Kid> {
    return this.http.delete(`${this.apiUrl}/consoleweb/${this.appId}/${schoolId}/kid/${kidId}`).toPromise().then(
      response => this.convertToKid(response.json().data)
    ).catch(this.handleError);
  }



  private convertToTeacher = function (serverTeacherData: ServerTeacherData): Teacher {
    let teacher = new Teacher(serverTeacherData.teacherId, serverTeacherData.teacherName, serverTeacherData.teacherSurname, serverTeacherData.pin, serverTeacherData.phones, serverTeacherData.username);
    return teacher;
  }

  private convertToServerTeacher = function (teacher: Teacher): ServerTeacherData {
    let convertedTeacher = new ServerTeacherData();
    convertedTeacher.pin = teacher.pin;
    convertedTeacher.teacherFullname = `${teacher.name} ${teacher.surname}`;
    convertedTeacher.teacherName = teacher.name;
    convertedTeacher.teacherSurname = teacher.surname;
    convertedTeacher.teacherId = teacher.id;
    convertedTeacher.sectionIds = [];
    convertedTeacher.phones = teacher.phoneNumbers;
    convertedTeacher.username = teacher.email;
    return convertedTeacher;
  }

  private convertToKid = function (serverKidData: ServerKidData): Kid {
    let allergies = serverKidData.allergies ? serverKidData.allergies.map(allergy => allergy.name) : null;
    let services = serverKidData.services && serverKidData.services.timeSlotServices ? serverKidData.services.timeSlotServices.map(service => this.convertToService(service)) : null;
    let convertedKid = new Kid(serverKidData.kidId, serverKidData.firstName, serverKidData.lastName, serverKidData.gender, serverKidData.birthDate, serverKidData.image, null, null, null, null, null, null, allergies, serverKidData.partecipateToSperimentation, services);
    let parents = serverKidData.persons.filter(person => person.parent);

    if (parents.length >= 1) {
      convertedKid.parent1 = this.convertToParent(parents[0]);
    }
    if (parents.length == 2) {
      convertedKid.parent2 = this.convertToParent(parents[1]);
    }


    let deleghe = serverKidData.persons.filter(person => !person.parent);
    if (deleghe.length > 0) {
      deleghe.map(delega => this.convertToDelega(delega)).forEach(convertedDelega => convertedKid.deleghe.push(convertedDelega));
    }

    convertedKid.section = serverKidData.section != undefined;

    return convertedKid;
  }

  private convertToServerKid = function (kid: Kid): ServerKidData {
    let convertedKid = new ServerKidData();
    convertedKid.kidId = kid.id;
    convertedKid.firstName = kid.name;
    convertedKid.lastName = kid.surname;
    convertedKid.persons = [];
    convertedKid.partecipateToSperimentation = kid.sperimentazione;
    convertedKid.gender = kid.gender;
    convertedKid.birthDate = new Date(Date.parse(kid.nascitaStr));
    convertedKid.services.timeSlotServices = kid.services.map(service => {
      let serverService: ServerServiceData = this.convertToServerService(service);
      serverService.enabled = true; // if a service if present in this array, it MUST be a enabled service for the kid
      return serverService;
    });


    convertedKid.allergies = kid.allergie.map(allergy => new Allergy(allergy, allergy));
    if (kid.parent1 && kid.parent1.id) {
      convertedKid.persons.push(this.convertToAuthPerson(kid.parent1));
    }
    if (kid.parent2 && kid.parent2.id) {
      convertedKid.persons.push(this.convertToAuthPerson(kid.parent2));
    }

    if (kid.deleghe) {
      kid.deleghe.forEach(delega => convertedKid.persons.push(this.convertFromDelegaToAuthPerson(delega)));
    }

    return convertedKid;
  }

  private convertToAuthPerson = function (parent: Parent): AuthPerson {
    let convertedParent = new AuthPerson();
    convertedParent.personId = parent.id;
    convertedParent.email = parent.emails;
    convertedParent.phone = parent.phoneNumbers;
    convertedParent.firstName = parent.name;
    convertedParent.lastName = parent.surname;
    convertedParent.fullName = `${convertedParent.firstName} ${convertedParent.lastName}`;
    convertedParent.parent = true;
    return convertedParent;
  }


  private convertFromDelegaToAuthPerson = function (delega: Delega): AuthPerson {
    let convertedParent = new AuthPerson();
    convertedParent.phone = delega.phoneNumbers;
    convertedParent.email = delega.emails;
    convertedParent.personId = delega.id;
    convertedParent.relation = delega.legame;
    convertedParent.adult = delega.maggiorenne;
    convertedParent.firstName = delega.name;
    convertedParent.authorizationDeadline = new Date(delega.scadenzaStr).getTime();
    convertedParent.lastName = delega.surname;
    return convertedParent;
  }

  private convertToParent = function (authPerson: AuthPerson): Parent {
    let parent = new Parent(authPerson.personId, authPerson.firstName, authPerson.lastName, authPerson.phone, authPerson.email);
    return parent;
  }

  private convertToDelega = function (authPerson: AuthPerson): Delega {
    let deadline = new Date(authPerson.authorizationDeadline.valueOf());
    let delega = new Delega(authPerson.personId, authPerson.firstName, authPerson.lastName, authPerson.phone, authPerson.email, authPerson.relation, deadline, authPerson.adult);
    return delega;
  }

  private convertToSchool = function (serverSchoolData: ServerSchoolData): School {
    let school = new School();
    school.id = serverSchoolData.schoolId;
    school.appId = serverSchoolData.appId;
    school.accessEmail = serverSchoolData.accessEmail;
    school.email = serverSchoolData.contacts && serverSchoolData.contacts.email.length > 0 ? serverSchoolData.contacts.email[0] : "";
    school.phoneNumbers = serverSchoolData.contacts && serverSchoolData.contacts.telephone ? serverSchoolData.contacts.telephone : [];
    school.name = serverSchoolData.name;
    school.address = serverSchoolData.address;

    school.assenze = serverSchoolData.absenceTypes ? serverSchoolData.absenceTypes.map(typeDef => typeDef.type) : [];
    school.malattie = serverSchoolData.frequentIllnesses ? serverSchoolData.frequentIllnesses.map(typeDef => typeDef.type) : [];

    // malattia is managed only as checkbox, but server side it is considered an absenceType
    // so I've to transform data to mantain difference from UI data and backend model representation
    school.malattia = school.assenze.indexOf(ServerSchoolData.ILLNESS_VALUE) >= 0;
    school.familiari = school.assenze.indexOf(ServerSchoolData.FAMILY_MOTIVATION_VALUE) >= 0;
    school.assenze = school.assenze.filter(absenceType => absenceType !== ServerSchoolData.ILLNESS_VALUE && absenceType !== ServerSchoolData.FAMILY_MOTIVATION_VALUE);


    // DA TOGLIERE
    school.teachers = [];
    school.servizi = serverSchoolData.services ? serverSchoolData.services.map(serverService => this.convertToService(serverService)) : [];
    school.groups = serverSchoolData.sections ? serverSchoolData.sections.map(serverSection => this.convertToGroup(serverSection)) : [];

    school.buses = serverSchoolData.buses;


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



  private convertToService = function (serverService: ServerServiceData): Service {
    let slots = serverService.timeSlots.map(timeSlot => this.convertToTime(timeSlot));
    let service = new Service(serverService.name, slots, null, serverService.regular);
    return service;
  }

  private convertToServerService = function (service: Service): ServerServiceData {
    let serverService = new ServerServiceData();
    serverService.name = service.servizio;
    serverService.regular = service.normale;
    serverService.timeSlots = service.fasce ? service.fasce.map(fascia => this.convertToServiceTimeSlot(fascia)) : [];
    return serverService;
  }

  private convertToTime(serviceTimeSlot: ServiceTimeSlot): Time {
    let fromTime: Date = moment(serviceTimeSlot.fromTime).toDate();
    let toTime: Date = moment(serviceTimeSlot.toTime).toDate();
    let t = new Time(serviceTimeSlot.name, fromTime, toTime);
    return t;
  }
  private convertToServiceTimeSlot(fascia: Time): ServiceTimeSlot {
    let serviceTimeSlot = new ServiceTimeSlot();
    serviceTimeSlot.name = fascia.name;
    serviceTimeSlot.fromTime = moment(fascia.start, "HH:mm").toDate();
    serviceTimeSlot.toTime = moment(fascia.end, "HH:mm").toDate();
    return serviceTimeSlot;
  }


  private convertToGroup = function (section: ServerSection): Group {
    let group: Group;
    if (section) {
      group = new Group(section.name, [], !section.group, []);
    }

    return group;
  }

  private convertToServerSection = function (group: Group): ServerSection {
    let serverSection: ServerSection;
    if (group) {
      serverSection = new ServerSection(group.name, !group.section);
    }

    return serverSection;
  }

  private convertToServerSchool = function (school: School): ServerSchoolData {
    let convertedSchool = new ServerSchoolData();
    convertedSchool.schoolId = school.id;
    convertedSchool.appId = school.appId;
    convertedSchool.name = school.name;
    convertedSchool.accessEmail = school.accessEmail;
    convertedSchool.contacts = new SchoolContacts();
    convertedSchool.contacts.telephone = school.phoneNumbers;
    convertedSchool.contacts.addEmail(school.email);
    if (school.assenze) {
      convertedSchool.absenceTypes = [];
      school.assenze.forEach(function (absence) {
        convertedSchool.absenceTypes.push({ typeId: absence, type: absence });
      });

      if (school.malattia) {
        convertedSchool.absenceTypes.push({ typeId: ServerSchoolData.ILLNESS_VALUE, type: ServerSchoolData.ILLNESS_VALUE });
      } else {
        let illnesIndex = convertedSchool.absenceTypes.findIndex(typedef => typedef.type === ServerSchoolData.ILLNESS_VALUE);
        if (illnesIndex >= 0) {
          convertedSchool.absenceTypes.splice(illnesIndex, 1);
        }
      }

      if (school.familiari) {
        convertedSchool.absenceTypes.push({ typeId: ServerSchoolData.FAMILY_MOTIVATION_VALUE, type: ServerSchoolData.FAMILY_MOTIVATION_VALUE });
      } else {
        let familiarIndex = convertedSchool.absenceTypes.findIndex(typedef => typedef.type === ServerSchoolData.FAMILY_MOTIVATION_VALUE);
        if (familiarIndex >= 0) {
          convertedSchool.absenceTypes.splice(familiarIndex, 1);
        }
      }
    }

    if (school.malattie) {
      convertedSchool.frequentIllnesses = [];
      school.malattie.forEach(function (absence) {
        convertedSchool.frequentIllnesses.push({ typeId: absence, type: absence });
      });
    }

    if (school.servizi) {
      convertedSchool.services = school.servizi.map(service => this.convertToServerService(service));
    }

    // private List<SectionProfile> sections;
    if (school.groups) {
      convertedSchool.sections = school.groups.map(group => this.convertToServerSection(group));
    }
    if (school.buses) {
      convertedSchool.buses = school.buses;
    }
    // private List<BusProfile> buses;

    return convertedSchool;



    // private String accessEmail;
    // private Timing regularTiming, anticipoTiming, posticipoTiming;
    // private String absenceTiming, retireTiming;
    // private List<TypeDef> teacherNoteTypes;
    // private List<TypeDef> foodTypes;
  }
}