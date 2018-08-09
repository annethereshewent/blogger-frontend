import { Component, OnInit, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Output, EventEmitter } from '@angular/core';
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from "../validator.service";

interface VerifyPasswordResponse {
  success: Boolean;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  production: Boolean = environment.production
  user: User;
  password: string;
  authorized: Boolean = false;

  new_password: string;
  new_password2: string;

  mainForm: FormGroup;
  securityForm: FormGroup;

  private userDiffer: KeyValueDiffer<string, any>;
  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(private http: HttpClient, private differs: KeyValueDiffers, private validatorService: ValidatorService) { 
    let user: User;
    if (user = JSON.parse(localStorage.getItem('current_user'))) {
      this.user = user;

      this.userDiffer = this.differs.find(this.user).create();
    }

    this.mainForm = new FormGroup({
      "username": new FormControl(this.user.username, [this.validatorService.required(), this.validatorService.spaces()], this.validatorService.checkForDuplicateUsername.bind(this.validatorService)),
      "blog_title": new FormControl(this.user.blog_title),
      "description": new FormControl(this.user.description)
    });

    this.securityForm = new FormGroup({
      "email": new FormControl(this.user.email, [this.validatorService.required(), Validators.email], this.validatorService.checkForDuplicateEmail.bind(this.validatorService))
      "passwords": new FormGroup({
        "password": new FormControl(this.new_password),
        "password2": new FormControl(this.new_password2, [Validators.min(8)])
      }, this.validatorService.passwordsMustMatch)
    });

  }

  ngOnInit(): void {

  }

  get username() {
    return this.mainForm.get('username');
  }

  verifyPassword(): void {
    this
      .http
      .post<VerifyPasswordResponse>(`${environment.server_url}/api/verify`, { id: this.user.user_id, password: this.password })
      .subscribe((data) => {
        if (data.success) {
          this.authorized = true;
        }
        else {
          console.log("could not authorize user.");
        }
      })
    ;
  }

  ngDoCheck(): void {
    if (this.userDiffer.diff(this.user)) {
      this.updateUser.emit(this.user);
    }
  }

}
