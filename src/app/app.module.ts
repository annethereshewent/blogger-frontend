import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { environment } from "../environments/environment";
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { RequestService } from './request.service';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { SafeHtmlPipe } from "../pipes/safehtml.pipe";
import { PostModalComponent } from './post-modal/post-modal.component';
import { YoutubeModalComponent } from './youtube-modal/youtube-modal.component';

const appRoutes: Routes = [
    { 
        path: 'users', component: UsersComponent, children: [
            {
                path: '', redirectTo: 'login', pathMatch: "full"
            },
            {
                path: 'login', component: LoginComponent
            },
            {
                path: "register", component: RegisterComponent
            },
            {
                path: "dashboard", component: DashboardComponent
            }
        ]
    },
    {
        path: '', redirectTo: 'users', pathMatch: "full"
    }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    UsersComponent,
    SafeHtmlPipe,
    PostModalComponent,
    YoutubeModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    RouterModule.forRoot(
        appRoutes,
        { enableTracing: environment.enable_tracing }
    )
  ],
  providers: [RequestService],
  bootstrap: [AppComponent],
  entryComponents: [PostModalComponent, YoutubeModalComponent]
})
export class AppModule { }
