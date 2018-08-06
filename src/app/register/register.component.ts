import { Component, OnInit } from '@angular/core';
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { RequestService } from "../request.service";


interface DuplicateInterface {
  duplicate: Boolean;
}
interface RegisterInterface {
  success: Boolean;
  token: String;
  user_id: number;
  username: String;
  avatar: String;
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

  constructor(private router: Router, private http: HttpClient,  private requestService: RequestService) {

    this.password = '';
    this.password2 = '';
    this.username = '';
    this.email = '';
    this.blog_title = '';

    this.registerForm = new FormGroup({
      "username": new FormControl(this.username, [this.required()], this.checkForDuplicateUsername.bind(this)),
      'email': new FormControl(this.email, [this.required(), Validators.email], this.checkForDuplicateEmail.bind(this)),
      "passwords": new FormGroup({
        "password": new FormControl(this.password, [this.required()]),
        "password2": new FormControl(this.password2, [this.required(), Validators.min(8)])
      }, this.passwordsMustMatch),
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

  required() {
    return (control: FormControl): any => {
      if (control.value == null || control.value.trim() == '') {
        return {
          required: {
            value: control.value
          } 
        };
      }

      return null; 
    }
    
  }

  checkForDuplicateUsername(control: FormControl) {
    if (control.value != '') {
      return this.checkForDuplicate(`${environment.server_url}/api/find_user`, {
        username: control.value
      }); 
    } 
  }

  checkForDuplicate(url, postParams) {
    clearTimeout(this.debounceTimeout);
    return new Promise((resolve, reject) => {
      this.debounceTimeout = setTimeout(() => {
        this
          .http
          .post<DuplicateInterface>(url, postParams)
          .subscribe((data) => {
            if (data.duplicate) {
              console.log("duplicate found");
              resolve({
                duplicate: {
                  value: postParams.email ? postParams.email : postParams.username
                }
              });
            }
            else {
              resolve(null);
            }
          })
      }, 600);
    }); 
  }
  
  checkForDuplicateEmail(control: FormControl) {
    if (control.value != '') {
      return this.checkForDuplicate(`${environment.server_url}/api/find_email`, {
        email: control.value
      });  
    }
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
          let user: User = new User(data.user_id, data.username, data.token, data.avatar);
          localStorage.setItem("current_user", JSON.stringify(user));

          this.router.navigate(["/users/dashboard"]);
        }
        else {
          console.log(data.message);
        }
      })
    ; 
  }

  passwordsMustMatch(passwordGroup: FormGroup) {
    let password = passwordGroup.controls.password.value;
    let password2 = passwordGroup.controls.password2.value;

    if (password != password2) {
      return {
        passwordMismatch: {
          value: password2
        }
      };
    }

    return null;
  }

}
