import { Injectable } from '@angular/core';
import { ResponseContentType, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
 
@Injectable()
export class UrlHelperService {
    constructor(
        private http: Http, /* Your favorite Http requester */
    ) {
    }
 
    get(url: string): Observable<any> {
        return new Observable((observer: Subscriber<any>) => {
            let objectUrl: string = null;
 
            // this.http
            //     .get(url, this.getHeaders(), {
            //         responseType: ResponseContentType.Blob as 'blob'
            //     })
            //     .subscribe(m => {
            //         objectUrl = URL.createObjectURL(m.blob());
            //         observer.next(objectUrl);
            //     });
 
            return () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                }
            };
        });
    }
 
    getHeaders(): Headers {
        let headers = new Headers();
 
        ////let token = this.authService.getCurrentToken();
        let token = { access_token: 'ABCDEF' }; // Get this from your auth service.
        if (token) {
            headers.set('Authorization', 'Bearer ' + token.access_token);
        }
 
        return headers;
    }
}