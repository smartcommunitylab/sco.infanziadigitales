import { Service } from './Classes/service';
import { Group } from './Classes/group';
import { Bus } from './Classes/bus';
import { Parent } from './Classes/parent';
import { Teacher } from './Classes/teacher';
import { Kid } from "./Classes/kid";

import { Injectable }    from '@angular/core';
import { Http, Headers } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { School } from "./Classes/school";

@Injectable()
export class WebService {
  private schoolUrl = 'api/school'
  private headers = new Headers({'Content-Type': 'application/json'});

  school : School;
  
  constructor(private http : Http) {}

  getData(): Promise<School[]> {
    return this.http.get(this.schoolUrl).toPromise().then(x=>x.json().data)
  }

  getSchool(id: string) : Promise<School> {
    const url = `${this.schoolUrl}/${id}`;
     return this.http.get(url)
    .toPromise()
    .then(response => response.json().data as School)
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
    return this.http
    .put(url, JSON.stringify(school), {headers: this.headers})
    .toPromise()
    .then(()=>school)
    .catch(this.handleError);
  }
}