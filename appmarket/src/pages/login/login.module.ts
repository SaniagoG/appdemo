import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { LoginModal } from './modal.login';


@NgModule({
  declarations: [
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    IonicPageModule.forChild(LoginModal)
  ],
})
export class LoginPageModule {}
