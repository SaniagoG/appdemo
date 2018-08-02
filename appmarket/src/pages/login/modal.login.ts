import { Component } from '@angular/core';
import { NavParams, ViewController} from 'ionic-angular';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'page-login-modal',
  providers: [LoginService],
  templateUrl: 'modal.login.html'
})
export class LoginModal {
  rootPage = 'LoginPage'; 
	rootParams;

	public query;
	public colegio;
	public colegios;
  lang;
  current_lang;

	constructor(navParams: NavParams, private viewCtrl: ViewController, private loginService: LoginService) {
		this.rootParams = Object.assign({}, navParams.data, {viewCtrl: viewCtrl});
    this.query=null;
    this.loginService.getLang().then((data_lang) => {
      this.lang=data_lang;
    });
    this.current_lang=navParams.get('current_lang');
		// This line will send the view controller into your child views, so you can dismiss the modals from there.
	}

  	getBusquedaColegios(e: any){
  		if(this.query.length>=3){
  			this.loginService.getSchools(this.query).subscribe((data)=>{
          this.colegios=Object.keys(data).map((key)=>{ return {key:key, value:data[key]}});
  			});
  		}else
        this.colegios=null;
    }

    setColegio(item){
    	this.colegio=item;
    	this.dismiss();
    }

	dismiss() {
		this.viewCtrl.dismiss(this.colegio);
	}

}