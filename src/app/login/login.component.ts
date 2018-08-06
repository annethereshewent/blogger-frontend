import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { User } from "../../classes/User";
import { RequestService } from "../request.service";

interface LoginResponse {
    success: Boolean;
    posts: Post[],
    token: String,
    user_id: String,
    username: String;
    avatar: String;
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

  constructor(private http: HttpClient, private router: Router, private requestService: RequestService) {
    let user = localStorage.getItem('current_user');
    if (user) {
      this.router.navigate(["/users/dashboard"]);
    }
  }
  login(): void {
    this.http.post<LoginResponse>(environment.server_url + "/api/login", {
      username: this.username,
      password: this.password
    })
     .subscribe((data) => {
        if (data.success) {
          console.log("login successful!");
          //login was successful! redirect to the next page
          this.requestService.posts = data.posts;
          //save the token/user to local storage or possibly a session if thats possible.
          let user = new User(data.user_id, data.username, data.token, data.avatar);
          localStorage.setItem("current_user", JSON.stringify(user));

          this.router.navigate(["/users/dashboard"]);
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
