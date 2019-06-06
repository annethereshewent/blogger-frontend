import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { User } from "../../classes/User";
import { RequestService } from "../request.service";

interface LoginResponse {
  success: Boolean,
  posts: Post[],
  token: string,
  user: User;
}

interface TokenResponse {
  access_token: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: String = '';
  password: String = '';
  invalidLogin: Boolean = false;

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
    this
      .http
      .post<TokenResponse>(`${environment.server_url}/oauth/token`, {
        username: this.username,
        password: this.password,
        grant_type: 'password'
      })
     .subscribe((data) => {
        if (data.access_token) {
          let token = data.access_token
          this.requestService.token = token

          this
            .http
            .get<LoginResponse>(`${environment.server_url}/api/fetch_user`)
            .subscribe((data) => {
              //login was successful! redirect to the next page
              this.requestService.posts = data.posts;
              //save the token/user to local storage or possibly a session if thats possible.
              let user = data.user

              user.token = token

              console.log(user)
              localStorage.setItem("current_user", JSON.stringify(user));

              this.router.navigate(["/users/dashboard"]); 
            })
          
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
