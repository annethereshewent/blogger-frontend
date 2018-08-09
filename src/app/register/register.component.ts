import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { RequestService } from "../request.service";
import { ValidatorService } from "../validator.service";



interface RegisterInterface {
  success: Boolean;
  user: User;
  posts: Post[];
  message: String;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  username: String;
  email: String;
  password: String;
  password2: String;
  blog_title: String;

  private debounceTimeout;


  registerForm: FormGroup;

  constructor(
    private router: Router, 
    private http: HttpClient,  
    private requestService: RequestService, 
    private validatorService: ValidatorService
  ) {

    if (JSON.parse(localStorage.getItem("current_user"))) {
      this.router.navigate(["/users/dashboard"]);
    }

    this.password = '';
    this.password2 = '';
    this.username = '';
    this.email = '';
    this.blog_title = '';

    this.registerForm = new FormGroup({
      "username": new FormControl(this.username, [this.validatorService.required(), this.validatorService.alphanumeric_plus()], this.validatorService.checkForDuplicateUsername.bind(this.validatorService)),
      'email': new FormControl(this.email, [this.validatorService.required(), Validators.email], this.validatorService.checkForDuplicateEmail.bind(this.validatorService)),
      "passwords": new FormGroup({
        "password": new FormControl(this.password, [this.validatorService.required()]),
        "password2": new FormControl(this.password2, [this.validatorService.required(), Validators.min(8)])
      }, this.validatorService.passwordsMustMatch),
      "blog_title": new FormControl(this.blog_title)
    });
  }

  openLoginPanel(): void {
    this.router.navigate(["/users/login"]);
  }

  ngOnInit() {

  }

  get passwordGroup() {
    return this.registerForm.get('passwords');
  }

  get usernameControl() {
    return this.registerForm.get('username');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return (<FormGroup>this.registerForm.get('passwords')).controls.password;
  }
  get password2Control() {
    return (<FormGroup>this.registerForm.get('passwords')).controls.password2;
  }

  register(): void {
    this
      .http
      .post<RegisterInterface>(`${environment.server_url}/api/register`, {
        displayname: this.username,
        blog_title: this.blog_title,
        email: this.email,
        password: this.password
      })
      .subscribe((data) => {
        if (data.success) {
          this.requestService.posts = data.posts;
          let user: User = data.user;
          localStorage.setItem("current_user", JSON.stringify(user));

          this.router.navigate(["/users/dashboard"]);
        }
        else {
          console.log(data.message);
        }
      })
    ; 
  }

}
