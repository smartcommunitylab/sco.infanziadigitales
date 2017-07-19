import { Insegnanti } from './../pages/Components/teacherSection/teacher.component';
import { TeacherModal } from './../pages/Components/Modals/teacherModal/teacherModal';
import { BusModal } from './../pages/Components/Modals/busModal/busModal';
import { InMemoryDataService } from './in-memory-data.service';
import { WebService } from './WebService';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { RouterModule }   from '@angular/router';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { HttpModule } from "@angular/http";
import { GroupModal } from "../pages/Components/Modals/groupModal/groupModal";
import { Gruppi } from "../pages/Components/gruppiSection/gruppi.component";
import { Buses } from "../pages/Components/busSection/bus.component";
import { Bambini } from "../pages/Components/kidSection/kid.component";
import { KidPage } from "../pages/Components/kidPage/kidPage";
import { DelegaPage } from "../pages/Components/kidPage/delega.component";
import { Info } from "../pages/Components/homeSection/info.component";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    GroupModal,
    BusModal,
    TeacherModal,
    Gruppi,
    Buses,
    Insegnanti,
    Bambini,
    KidPage,
    DelegaPage,
    Info
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    InMemoryWebApiModule.forRoot(InMemoryDataService)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    GroupModal,
    BusModal,
    TeacherModal,
    Gruppi,
    Buses,
    Insegnanti,
    Bambini,
    KidPage,
    DelegaPage,
    Info
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    WebService
  ]
})
export class AppModule {}
