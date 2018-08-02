import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { LoginService } from '../services/login.service';
import { MainService } from '../services/main.service';

@Component({
  templateUrl: 'app.html',
  providers: [LoginService, MainService]
})
export class CiudadEducativaApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;
  activePage: any;
  name: string;
  lastname: string;
  url_profile_img: string;
  ready: boolean;
  periods;
  current_period;
  current_period_id;
  lang;
  current_lang;

  
  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public loginService: LoginService, public menuCtrl: MenuController, private mainService : MainService) {
    this.initializeApp();
    this.current_lang='es_co';
    // used for an example of ngFor and navigatio

    this.activePage = this.pages[0];
    this.ready=false;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.loginService.isLogin().then((val) =>{
        if(!val)
          this.nav.setRoot(LoginPage);
        else
          this.updateData();
      });
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.loginService.isLogin().then((val) =>{
      if(val){
          this.updateData();
          this.nav.setRoot(page.component,{
              current_period : this.current_period
          });
      }
    });
    this.activePage = page;
  }

  checkActive(page){
    return page == this.activePage;
  }

  logout(){
    this.mainService.get({
      "action":"doLogout"
    }).then((data_res)=>{
      data_res.subscribe((res)=>{
        this.url_profile_img = null;
        this.name=null;
        this.lastname=null;
        this.loginService.logout();
        this.menuCtrl.close();
        this.menuCtrl.enable(false, 'myMenu');
        this.activePage = this.pages[0];
        this.nav.setRoot(LoginPage);
        this.ready=false;

      });
    });
  }

  updateMenu(){
    if(this.loginService.isLogin())
      this.updateData();   
  }

  updateData(){
    if(this.ready) return;
    this.ready=true;
    this.loginService.getUserData().then((data) =>{
        this.url_profile_img = "https://cied-discoduro-akiai7lejddstdf23hhq-1344523962.s3.amazonaws.com/"+data.school_id+"/img_usuarios/"+data.nid+".jpg";
        this.name=data.name;
        this.lastname=data.lastname;
        this.current_lang=data.lang;
        this.current_period_id=data.at.at_id;
        this.current_period=data.at;
    });
    this.loginService.getLang().then((data)=>{
      console.log("lang: ",data);
      this.lang=data;
    }).catch((error)=>{
      console.log("get lang error: ", error);
    });
  }

  updateCurrentPeriod(){
    if(this.current_period.at_id==this.current_period_id) return;
    this.current_period=this.periods.find(x=> x.at_id==this.current_period_id);
    this.mainService.get({
      "action":"setAcademicTermInSession",
      "at_id":this.current_period.at_id
    }).then((data_res)=>{
      data_res.subscribe((res)=>{
        this.loginService.updateData(this.current_period, this.periods).then((result)=>{
          setTimeout(()=>{ 
            this.openPage(this.activePage);
            this.menuCtrl.close();
          },3000);
        });
      });
    });
  }

  public static get API_ENDPOINT(): string { return 'https://plataforma.ciudadeducativa.com/app/web/api/index.php'; }
  public static get API_LOGIN_KEY(): string { return 'w1e2r3W4R6E7g5T8Y7J9U3Y4E5r7t6h0r1t2E3R4t7J8u5f6g8Q9w0A0S9x1c2S1D1F1g1m1n458bPo'; }
}
