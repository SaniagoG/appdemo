import { Injectable } from '@angular/core';
import { Http, Response} from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';
import { CiudadEducativaApp } from '../app/app.component';
import 'rxjs/add/operator/map'; 

@Injectable()
export class LoginService {

    constructor(private http: Http, private storage: NativeStorage) {}

    login(school: number, user: string, password: string) {
        console.log("intento iniciar sesion");
        let params='?action=doLogin&login_api_key='+CiudadEducativaApp.API_LOGIN_KEY+'&school_id='+String(school)+
        '&login='+user+'&password='+password;
        return this.http.get(CiudadEducativaApp.API_ENDPOINT+params).map((res:Response) => res.json())
        .map((res) => {
            console.log("respuesta login :");
            if (!res.error){
                console.log("inicio session");
                return this.get({
                    'action':'getCurrentAcademicTerms',
                    'excluded_statuses':'4,0'
                },res.school_api_key,res.user_api_key).subscribe((res_current_academic_terms)=>{
                    let current_period=Object.keys(res_current_academic_terms).map((key)=>{ return {key:key, value:res_current_academic_terms[key]}}).values().next().value.value;
                    console.log("academic terms received");
                    return this.get({
                        "action":"getCurrentEnrollment",
                        "u_id": res.user.u_id,
                        "at_id": current_period ? current_period.at_id : 'undefined'
                    },res.school_api_key,res.user_api_key).subscribe((res_current_enrollment)=>{
                        console.log("enrollment received");
                        return this.storage.setItem('user_data',{
                            'u_id':res.user.u_id,
                            'school_id':res.school.school_id,
                            'name':res.user.name,
                            'lastname':res.user.lastname,
                            'school_api_key':res.school_api_key,
                            'user_api_key':res.user_api_key,
                            'nid':res.user.nid,
                            'at':current_period,
                            'e':res_current_enrollment,
                            'lang':res.user.lang
                        }).then(
                            () => {
                                console.log('Stored item!');
                                this.get({'action':'getAcademicTerms'},res.school_api_key,res.user_api_key).subscribe((res_academic)=>{
                                    let temp=[];
                                    for(let item of Object.keys(res_academic))
                                        temp.push(res_academic[item]);
                                    this.storage.setItem('academicTerms',temp).then(
                                        () => {
                                            console.log('Academic Terms Stored');
                                            if(!current_period){
                                                current_period=temp.find(x=> x.at_id==res_current_enrollment.at_id);
                                                this.storage.setItem('user_data',{
                                                    'u_id':res.user.u_id,
                                                    'school_id':res.school.school_id,
                                                    'name':res.user.name,
                                                    'lastname':res.user.lastname,
                                                    'school_api_key':res.school_api_key,
                                                    'user_api_key':res.user_api_key,
                                                    'nid':res.user.nid,
                                                    'at':current_period,
                                                    'e':res_current_enrollment,
                                                    'lang':res.user.lang
                                                }).then(
                                                    ()=> console.log('New Current Academic Term Stored'),
                                                    (err)=> console.log('Error New Current Academic Term Stored')
                                                );
                                            }
                                        },
                                        error => console.log("Academic Terms Store Error")
                                    );
                                });
                                if(res_current_enrollment.e_id){
                                    this.get({
                                        "action":"getGroupsXCourseXEnrollment",
                                        "e_id":res_current_enrollment.e_id
                                    },res.school_api_key,res.user_api_key).subscribe((res_courses_enroll) => {
                                        let temp_group = [];
                                        let temp_cursos = '';
                                        for(let group of Object.keys(res_courses_enroll)){
                                            temp_group.push(res_courses_enroll[group]);
                                            temp_cursos+=res_courses_enroll[group].c_id+',';
                                        }
                                        this.storage.setItem('groupsXCourseXEnrollment',temp_group).then(
                                            () => console.log('GroupsXCourseXEnrollment Stored'),
                                            error => console.log("GroupsXCourseXEnrollment Store Error")
                                        );
                                        this.get({
                                            "action":"getCourses",
                                            "c_id":temp_cursos.substr(0,temp_cursos.length-1)
                                        },res.school_api_key,res.user_api_key).subscribe((res_course) => {
                                            let temp=[];
                                            for(let item of Object.keys(res_course))
                                                temp.push(res_course[item]);
                                            this.storage.setItem('courses',temp).then(
                                                () => console.log('Courses Stored'),
                                                error => console.log("Courses Store Error")
                                            );
                                        });
                                    });
                                }
                                this.get({
                                    "action":"getAssignmentTypes"
                                },res.school_api_key,res.user_api_key).subscribe((res_type_assignments) => {
                                    let temp=[];
                                    for(let key of Object.keys(res_type_assignments))
                                        temp.push(res_type_assignments[key]);
                                    this.storage.setItem('assignmentTypes',temp).then(
                                        () => console.log('Assignment Types Stored'),
                                        error => console.log("Assignment Types Store Error")
                                    );
                                });
                                if(res_current_enrollment.e_id){
                                    this.get({
                                        "action":"getStudentTeachers",
                                        "e_id":res_current_enrollment.e_id,
                                        "index":"c_id"
                                    },res.school_api_key,res.user_api_key).subscribe((res_teacher)=>{
                                        let temp=[];
                                        for(let item_teacher of Object.keys(res_teacher))
                                            temp.push(res_teacher[item_teacher]);
                                        this.storage.setItem('teachers',temp).then(
                                            () => console.log('Teachers Stored'),
                                            error => console.log("Teachers Store Error")
                                        );
                                    });
                                }
                                this.get({
                                    "action":"getStandardTypes"
                                },res.school_api_key,res.user_api_key).subscribe((res_type_standard) => {
                                    let temp=[];
                                    for(let key of Object.keys(res_type_standard))
                                        temp.push(res_type_standard[key]);
                                    this.storage.setItem('standardTypes',temp).then(
                                        () => console.log('Standard Types Stored'),
                                        error => console.log("Standard Types Error")
                                    );
                                });
                                this.get({
                                    "action":"getEvaluationTerms",
                                    "at_id":current_period.at_id
                                },res.school_api_key,res.user_api_key).subscribe((res_evaluation_terms)=>{
                                    let temp = [];
                                    for(let evaluation_term of Object.keys(res_evaluation_terms))
                                        temp.push(res_evaluation_terms[evaluation_term]);
                                    this.storage.setItem('evaluationTerms',temp).then(
                                        () => console.log('Evaluation Terms Stored'),
                                        error => console.log("Evaluation Terms Error")
                                    );
                                });
                                return true;
                            },
                            error => {
                                console.error('Error storing item', error);
                                return false;
                            }
                        );
                    });
                });
            }else
                return false;
        });
    }

    updateData(current_period, periods){
        return this.getUserData().then((res)=>{
            return this.get({
                "action":"getCurrentEnrollment",
                "u_id": res.u_id,
                "at_id": current_period.at_id
            },res.school_api_key,res.user_api_key).subscribe((res_current_enrollment)=>{
                console.log("enrollment received");
                if(res_current_enrollment.at_id!=current_period.at_id)
                    current_period=periods.find(x=> x.at_id==res_current_enrollment);
                return this.storage.setItem('user_data',{
                    'u_id':res.u_id,
                    'school_id':res.school_id,
                    'name':res.name,
                    'lastname':res.lastname,
                    'school_api_key':res.school_api_key,
                    'user_api_key':res.user_api_key,
                    'nid':res.nid,
                    'at':current_period,
                    'e':res_current_enrollment,
                    'lang':res.lang
                }).then(
                    () => {
                        if(res_current_enrollment.e_id){
                            this.get({
                                "action":"getGroupsXCourseXEnrollment",
                                "e_id":res_current_enrollment.e_id
                            },res.school_api_key,res.user_api_key).subscribe((res_courses_enroll) => {
                                let temp_group = [];
                                let temp_cursos = '';
                                for(let group of Object.keys(res_courses_enroll)){
                                    temp_group.push(res_courses_enroll[group]);
                                    temp_cursos+=res_courses_enroll[group].c_id+',';
                                }
                                this.storage.setItem('groupsXCourseXEnrollment',temp_group).then(
                                    () => console.log('GroupsXCourseXEnrollment Stored'),
                                    error => console.log("GroupsXCourseXEnrollment Store Error")
                                );
                                this.get({
                                    "action":"getCourses",
                                    "c_id":temp_cursos.substr(0,temp_cursos.length-1)
                                },res.school_api_key,res.user_api_key).subscribe((res_course) => {
                                    let temp=[];
                                    for(let item of Object.keys(res_course))
                                        temp.push(res_course[item]);
                                    this.storage.setItem('courses',temp).then(
                                        () => console.log('Courses Stored'),
                                        error => console.log("Courses Store Error")
                                    );
                                });
                            });
                        }
                        if(res_current_enrollment.e_id){
                            this.get({
                                "action":"getStudentTeachers",
                                "e_id":res_current_enrollment.e_id,
                                "index":"c_id"
                            },res.school_api_key,res.user_api_key).subscribe((res_teacher)=>{
                                let temp=[];
                                for(let item_teacher of Object.keys(res_teacher))
                                    temp.push(res_teacher[item_teacher]);
                                this.storage.setItem('teachers',temp).then(
                                    () => console.log('Teachers Stored'),
                                    error => console.log("Teachers Store Error")
                                );
                            });
                        }
                        this.get({
                            "action":"getEvaluationTerms",
                            "at_id":current_period.at_id
                        },res.school_api_key,res.user_api_key).subscribe((res_evaluation_terms)=>{
                            let temp = [];
                            for(let evaluation_term of Object.keys(res_evaluation_terms))
                                temp.push(res_evaluation_terms[evaluation_term]);
                            this.storage.setItem('evaluationTerms',temp).then(
                                () => console.log('Evaluation Terms Stored'),
                                error => console.log("Evaluation Terms Error")
                            );
                        });
                        return true;
                    },
                    error => {
                        console.error('Error storing item', error);
                        return false;
                    }
                );
            });
        });
    }

    getLang(){
        return this.storage.getItem('lang').then((data)=>{
            return data;
        },(err)=>{
            let request = this.http.get(CiudadEducativaApp.API_ENDPOINT+'?action=get_all_language_files_for_this_section&section=mobile_app_students').map((res:Response) => res.json());
            request.subscribe((res_lang)=>{
                this.storage.setItem('lang',res_lang).then(
                    () => console.log('Lang Stored'),
                    error => console.log("Lang Store Error")
                );
            }); 
            return request.toPromise();
        });
    }

    getSchools(query : string){
        let params='?action=searchSchool&active=1&query='+query.toLowerCase(); 
        return this.http.get(CiudadEducativaApp.API_ENDPOINT+params).map((res:Response) => res.json());
    }

    isLogin(){
        return this.storage.getItem('user_data').then(
            (data) => {return true;},
            (error) => {return false;}
        );
    }

    logout(){
        this.storage.setItem('user_data',null);
        this.storage.clear();
        this.getLang();
    }

    getUserData(){
        return this.storage.getItem('user_data');
    }

    get(data, school_api_key, user_api_key) {
        let params='?';
        for(let key in data){
            params+=String(key)+'='+String(data[key])+'&';
        }
        params+='school_api_key='+school_api_key+'&';
        params+='user_api_key='+user_api_key;
        return this.http.get(CiudadEducativaApp.API_ENDPOINT+params).map((res:Response) => res.json());
    }
}    