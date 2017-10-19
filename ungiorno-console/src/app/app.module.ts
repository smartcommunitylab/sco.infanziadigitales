import { PopoverPage } from './../pages/Components/Modals/orariModal/popoverOrari';
import { Insegnanti } from './../pages/Components/teacherSection/teacher.component';
import { TeacherModal } from './../pages/Components/Modals/teacherModal/teacherModal';
import { WebService, requestOptionsProvider } from '../services/WebService';
import { LoginService } from '../services/login.service'
import { ConfigService } from '../services/config.service'
import { UrlHelperService } from '../services/urlHelper.service'
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HttpModule } from "@angular/http";
import { GroupModal } from "../pages/Components/Modals/groupModal/groupModal";
import { Gruppi } from "../pages/Components/gruppiSection/gruppi.component";
import { Bambini } from "../pages/Components/kidSection/kid.component";
import { Info } from "../pages/Components/homeSection/info.component";
import { KidPage } from "../pages/Components/kidSection/kidPage/kidPage";
import { Orari } from "../pages/Components/orariSection/orari.component";
import { OrariModal } from "../pages/Components/Modals/orariModal/orariModal";
import { PopoverTimepicker } from "../pages/Components/Modals/orariModal/popoverTimepicker";
import { ListWidget } from "../pages/Components/list-widget/list-widget";
import { IonicStorageModule } from '@ionic/storage';
import { APP_INITIALIZER } from '@angular/core';
import { UserService } from '../services/user.service';
import { LoginPage } from '../pages/login/login';
import { Ng2OrderModule } from 'ng2-order-pipe';
import { SecurePipe } from '../services/pipe'

export function initConfig(config: ConfigService) {
  return () => config.load()
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GroupModal,
    TeacherModal,
    OrariModal,
    Gruppi,
    Insegnanti,
    Bambini,
    KidPage,
    Info,
    Orari,
    PopoverPage,
    PopoverTimepicker,
    ListWidget,
    SecurePipe,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    Ng2OrderModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GroupModal,
    TeacherModal,
    OrariModal,
    Gruppi,
    Insegnanti,
    Bambini,
    KidPage,
    Info,
    Orari,
    PopoverPage,
    PopoverTimepicker,
    ListWidget,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    WebService,
    UrlHelperService,
    LoginService,
    ConfigService,
    { provide: APP_INITIALIZER, useFactory: initConfig, deps: [ConfigService], multi: true },
    UserService,
    requestOptionsProvider
  ]
})
export class AppModule { }
