import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { CiudadEducativaApp } from '../app/app.component';
import { LoginService } from './login.service';
import 'rxjs/add/operator/map';

@Injectable()
export class MainService {

    constructor(private http: Http, private loginService: LoginService) {
       
    }

    get(data) {
        let params='?';
        for(let key in data){
            params+=String(key)+'='+String(data[key])+'&';
        }
        return this.loginService.getUserData().then((data)=>{
            params+='school_api_key='+data.school_api_key+'&';
            params+='user_api_key='+data.user_api_key;
            console.log(CiudadEducativaApp.API_ENDPOINT+params);
            return this.http.get(CiudadEducativaApp.API_ENDPOINT+params).map((res:Response) => res.json());
        });
    }
}    