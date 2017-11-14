import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './app.constants';
import { Router } from '@angular/router';



@Injectable()
export class appService {
    private headers: Headers;

    constructor(private _http: Http, public _configuration: Configuration, public router: Router) {
    }

    private setHeaders() {
        let token = localStorage.getItem("access_token");
        if (token == '' || token == undefined || token == null) {
            this._configuration.isAuthenticated = false;
            this.router.navigate(['/login']);
        }
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + token);
        this.headers.append('ICustomer', this._configuration.selectedCustomer.toString());
    }


    public Get = (url: string, parameters: Array<any>): Observable<any> => {
        this.setHeaders();

        let params: URLSearchParams = new URLSearchParams();

        if (parameters != null) {
            parameters.forEach((item) => {
                params.set(item.name, item.value);
            });
        }

        let options = new RequestOptions({ headers: this.headers, body: '', search: params });
        return this._http.get(url, options).map(res => res.json());
    }

    public GetMultiple = (url: string, parameters: Array<any>, url1: string, parameters1: Array<any>): any => {
        this.setHeaders();

        let params: URLSearchParams = new URLSearchParams();
        let params1: URLSearchParams = new URLSearchParams();

        if (parameters != null) {
            parameters.forEach((item) => {
                params.set(item.name, item.value);
            });
        }
        let options = new RequestOptions({ headers: this.headers, body: '', search: params });

        if (parameters1 != null) {
            parameters1.forEach((item) => {
                params1.set(item.name, item.value);
            });
        }
        let options1 = new RequestOptions({ headers: this.headers, body: '', search: params1 });

        return Observable.forkJoin(
            this._http.get(url, options).map(res => res.json()),
            this._http.get(url1, options1).map(res => res.json())
        );
    }


    public GetAnonymous = (url: string, parameters: Array<any>): Observable<any> => {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        let params: URLSearchParams = new URLSearchParams();

        if (parameters != null) {
            parameters.forEach((item) => {
                params.set(item.name, item.value);
            });
        }

        let options = new RequestOptions({ headers: this.headers, body: '', search: params });
        return this._http.get(url, options).map(res => res.json());
    }

    public saveAnonymous = (url: string, data: any): Observable<any> => {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        let options = new RequestOptions({ headers: this.headers });
        return this._http.post(url, data, options).map(res => res.json());
    }

    public save = (url: string, data: any): Observable<any> => {
        this.setHeaders();
        let options = new RequestOptions({ headers: this.headers });
        return this._http.post(url, data, options).map(res => res.json());
    }

    public saveMultiple = (url: string, data: any, url1: string, data1: any): any => {
        this.setHeaders();

        let options = new RequestOptions({ headers: this.headers });
        let options1 = new RequestOptions({ headers: this.headers });

        return Observable.forkJoin(
            this._http.post(url, data, options).map(res => res.json()),
            this._http.post(url1, data1, options1).map(res => res.json())
        );
    }

    public auth = (url: string, parameters: Array<any>): Observable<any> => {
        this.headers = new Headers();
        this.headers.append('content-type', 'application/x-www-form-urlencoded');
        this.headers.append('cache-control', 'no-cache');

        let params: URLSearchParams = new URLSearchParams();

        if (parameters != null) {
            parameters.forEach((item) => {
                params.set(item.name, item.value);
            });
        }

        let options = new RequestOptions({ headers: this.headers });
        return this._http.post(url, params, options).map(res => res.json());
    }

}