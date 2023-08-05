import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxWebrtcModule } from 'ngx-webrtc';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HeaderComponent } from './components/header/header.component';
import { RoomComponent } from './components/room/room.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';


const socketConfig: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    RoomComponent,
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(socketConfig),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SocketIoModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    NgxWebrtcModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
