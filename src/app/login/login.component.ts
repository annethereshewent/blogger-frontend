import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { User } from "../../classes/User";
import { RequestService } from "../request.service";
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface LoginResponse {
  success: Boolean,
  posts: Post[],
  access_token: string,
  user: User
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  invalidLogin: boolean = false;
  loading: boolean = false

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private requestService: RequestService
  ) {
    let user = localStorage.getItem('current_user');
    if (user) {
      this.router.navigate(["/users/dashboard"]);
    }
  }
  login(): void {
    this.loading = true
    this
      .http
      .post<LoginResponse>(`${environment.server_url}/oauth/token`, {
        username: this.username,
        password: this.password,
        grant_type: 'password'
      })
      .pipe(catchError((error) => {
        if (error == 'Unauthorized') {
          this.loading = false
          this.invalidLogin = true
          return throwError("Invalid login")
        }
        return throwError("An unknown error has occurred")
      }))
     .subscribe((data) => {
        this.loading = false
        if (data.access_token) {
          
          let token = data.access_token
          this.requestService.token = token

          //save the token/user to local storage or possibly a session if thats possible.
          let user = data.user

          user.token = token
          localStorage.setItem("current_user", JSON.stringify(user));

          this.router.navigate(["/users/dashboard"])  
        }
        else {
          //invalid login
          this.invalidLogin = true;
        }
      })
   ;
  }

  openRegisterPanel(): void {
    this.router.navigate(["/users/register"]);
  } 

  ngOnInit() {

  }

}
