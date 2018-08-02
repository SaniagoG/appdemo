import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, MenuController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LoginService } from '../../services/login.service';
import { LoginModal } from './modal.login';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  providers: [LoginService],
  templateUrl: 'login.html',
})
export class LoginPage {

    public school;
    public school_name;
    public user;
    public password;
    public schools;
    public modal_show;
    public msg=false;
    process;
    lang;
    current_lang;

    constructor(public navCtrl: NavController, public navParams: NavParams, private loginService: LoginService, public modalCtrl: ModalController, public menuCtrl: MenuController) {
        this.loginService.isLogin().then((data)=>{
            if(data)
                this.navCtrl.setRoot(HomePage);
        });
        this.modal_show=false;
        this.menuCtrl.enable(false, 'myMenu');
        this.process=false;
        this.current_lang='es_co';
    }

    login(){
        if(this.process) return;
        this.process=true;
        console.log("boton de inicio de sesion invocado");
        this.loginService.login(this.school.school_id,this.user,this.password).subscribe((data) => {
            if(data)
                setTimeout(()=>{   
                    this.process=false; 
                    this.navCtrl.setRoot(HomePage);
                },4000);
            else{
                this.process=false;
                this.msg=true;
            }
        });
    }

    changeLang(lang){
        this.current_lang=lang;
    }

    showLoginModal() {
        if(!this.modal_show){
            let loginModal = this.modalCtrl.create(LoginModal,{
                "current_lang":this.current_lang
            });
            loginModal.onDidDismiss(data => {
                this.school=data;
                if(data)
                    this.school_name=data.school_name;
                this.modal_show=false;
            });
            loginModal.present();
        }
        this.modal_show=true;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
        this.loginService.getLang().then((data)=>{
            this.lang=data;
        });
    }

}
