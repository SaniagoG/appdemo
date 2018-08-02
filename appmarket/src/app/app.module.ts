import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HttpModule } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { CiudadEducativaApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { LoginModal } from '../pages/login/modal.login';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    CiudadEducativaApp,
    LoginPage,
    HomePage,
    LoginModal,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(CiudadEducativaApp, {
        platforms: {
          ios: {
            backButtonText: '',
            pageTransition: 'md-transition'
          }
        }
      })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CiudadEducativaApp,
    LoginPage,
    HomePage,
    LoginModal,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NativeStorage,
    BarcodeScanner,
    InAppBrowser,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
