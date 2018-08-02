import { Component } from '@angular/core';
import { NavController, MenuController, NavParams} from 'ionic-angular';
import { MainService } from '../../services/main.service';
import { LoginService } from '../../services/login.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-home',
  providers: [MainService, LoginService],
  templateUrl: 'home.html'
})
export class HomePage {

	current_period;
	enrrollement;
	assignments;
	courses;
	current_date;
	start_date;                                
	type_assignments;
	days = ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"];
	months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
	colors = ["","examen","tarea","trabajo-clase","trabajo-clase","trabajo-clase","participacion-clase","tarea","tarea","examen","examen","tarea","tarea"];
	lang;
	current_lang;
	flag_end;

	constructor(public navCtrl: NavController, public menuCtrl: MenuController, private mainService : MainService, private loginService : LoginService, public navParams : NavParams) {
		this.menuCtrl.enable(true, 'myMenu');
		this.courses = [];
		this.assignments=[];
		this.type_assignments=[];
		this.flag_end=false;
	}

	ngOnInit(){
		this.loginService.getLang().then((data)=>{
	    	this.lang=data;
			this.loginService.isLogin().then((data)=>{
				if(data){
					this.current_period = this.navParams.get("current_period");
					this.loginService.getUserData().then((user_data)=>{
						this.current_period=user_data.at;
						this.enrrollement=user_data.e;
						this.current_lang=user_data.lang;
						this.days=[this.lang[this.current_lang].day_02,this.lang[this.current_lang].day_03,this.lang[this.current_lang].day_04,this.lang[this.current_lang].day_05,this.lang[this.current_lang].day_06,this.lang[this.current_lang].day_07,this.lang[this.current_lang].day_01];
	                    this.months=[this.lang[this.current_lang].month_01.substring(0,3),this.lang[this.current_lang].month_02.substring(0,3),this.lang[this.current_lang].month_03.substring(0,3),this.lang[this.current_lang].month_04.substring(0,3),this.lang[this.current_lang].month_05.substring(0,3),this.lang[this.current_lang].month_06.substring(0,3),this.lang[this.current_lang].month_07.substring(0,3),this.lang[this.current_lang].month_08.substring(0,3),this.lang[this.current_lang].month_09.substring(0,3),this.lang[this.current_lang].month_10.substring(0,3),this.lang[this.current_lang].month_11.substring(0,3),this.lang[this.current_lang].month_12.substring(0,3)];  
						this.current_date=new Date(this.current_period.end_date);
						this.start_date=new Date(this.current_period.start_date);
						let d = new Date(this.current_date.toDateString());
						d.setMonth(this.current_date.getMonth()-1);
						if(user_data.e.e_id){
							this.mainService.get({
								"action":"getAllStudentAssignments",
								"e_id":user_data.e.e_id,
								"order_by":"fecha%20desc",
								"index":"fecha,a_id",
								"hie_id":"2",
								"date_max": this.current_date.getFullYear()+"-"+(this.current_date.getMonth()+1)+"-"+this.current_date.getDate(),
								"date_min": d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()
							})
						}
				    });
				}else
					this.navCtrl.setRoot(LoginPage);	
			});
		});
	}

	getCourseData(id){
		return this.courses.find(x => x.c_id == id);
	}

	getDay(date){
		let d = new Date(date);
		return this.days[d.getDay()];
	}

	getDayNumber(date){
		let d = new Date(date);
		d.setDate(d.getDate()+1);
		return d.getDate();
	}

	getMonth(date){
		let d = new Date(date);
		d.setDate(d.getDate()+1);
		return this.months[d.getMonth()];
	}

	getMoreAssignments(infiniteScroll){
		if(!this.enrrollement.e_id) return;
		let d = new Date(this.current_date.toDateString());
		if(this.start_date.getTime()>this.current_date.getTime()){
			if(infiniteScroll)
				infiniteScroll.complete();
			this.flag_end=true;
			return;
		}
		d.setMonth(this.current_date.getMonth()-1);
		this.mainService.get({
			"action":"getAllStudentAssignments",
			"e_id":this.enrrollement.e_id,
			"order_by":"fecha%20desc",
			"index":"fecha,a_id",
			"hie_id":"2",
			"date_max": this.current_date.getFullYear()+"-"+(this.current_date.getMonth()+1)+"-"+this.current_date.getDate(),
			"date_min": d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()
		}).then((data_assignments) => {
			data_assignments.subscribe((res_assignments) => {
				this.current_date=d;
				if(res_assignments.success==false){
					this.getMoreAssignments(infiniteScroll);
				}else{
					for(let key of Object.keys(res_assignments)){
						let temp=[]
						for(let key1 of Object.keys(res_assignments[key])){
							let course = this.getCourseData(res_assignments[key][key1].c_id);
							temp.push({assignment:res_assignments[key][key1],course:course})
						}	
						this.assignments.push({key:key,value:temp});
					}
					if(this.assignments.length<10) 
						this.getMoreAssignments(null);
					if(infiniteScroll) 
						infiniteScroll.complete();
				}
			});
		});
	}

	getTypeAssignment(id){
		return this.type_assignments.find(x => x.type_id == id);
	}

	capitalize(string) {
	    return string ? string.charAt(0).toUpperCase() + string.slice(1) : string;
	}
}
