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
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlogComponent } from './blog/blog.component';
import { AccountComponent } from './account/account.component';
import { AlertModule } from 'ngx-bootstrap/alert';
import { PostsComponent } from './posts/posts.component';
import { CommentsComponent } from './comments/comments.component';
import { ChatComponent } from './chat/chat.component';

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
            },
            {
                path: 'tags/:tag_name', component: DashboardComponent
            },
            {
                path: "search/:search_term", component: DashboardComponent
            }
        ]
    },
    {
        path: '', redirectTo: 'users', pathMatch: "full"
    },
    {
        path: 'blog', component: BlogComponent, children: [
            {
                path: "account", component: AccountComponent
            },
            {
                path: "posts/:username", redirectTo: "/blog/posts/:username/1", pathMatch: "full"
            },
            {
                path: "posts/:username/:page", component: PostsComponent
            },
            {
                path: "comments/:username/:post_id", component: CommentsComponent
            }
        ]
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
    YoutubeModalComponent,
    ImageModalComponent,
    BlogComponent,
    AccountComponent,
    PostsComponent,
    CommentsComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    TagInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    HttpClientModule,
    DropzoneModule,
    AlertModule.forRoot(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    RouterModule.forRoot(
        appRoutes,
        { enableTracing: false }
    )
  ],
  providers: [RequestService],
  bootstrap: [AppComponent],
  entryComponents: [PostModalComponent, YoutubeModalComponent, ImageModalComponent]
})
export class AppModule { }
