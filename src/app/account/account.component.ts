import { Component, OnInit, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Output, EventEmitter, HostBinding } from '@angular/core';
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestService } from "../request.service";
import { ValidatorService } from "../validator.service";
import { Router, ActivatedRoute } from '@angular/router';

interface GenericResponse {
  success: boolean;
  message: string;
}
interface UpdateUserResponse {
  success: boolean;
  user: User;
  message: string;
}

interface FileReaderEventTarget extends EventTarget {
  result:string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage():string;
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

  alertSuccess = false;
  alertDanger = false;

  new_password: string;
  new_password2: string;

  mainForm: FormGroup;
  securityForm: FormGroup;

  avatar: File = null;

  @HostBinding('class.active') is_active: boolean = false;

  private userDiffer: KeyValueDiffer<string, any>;
  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(
    private http: HttpClient, 
    private differs: KeyValueDiffers, 
    private validatorService: ValidatorService, 
    private requestService: RequestService,
    private router: Router
  ) { 
    let user: User;
    if (user = JSON.parse(localStorage.getItem('current_user'))) {
      this.requestService.sidebar_hidden$.subscribe((active) => this.is_active = active)
      this.user = user;

      this.updateUser.emit(this.user);

      this.userDiffer = this.differs.find(this.user).create();

      this.mainForm = new FormGroup({
        "username": new FormControl(this.user.username, [this.validatorService.required(), this.validatorService.alphanumeric_plus()], this.validatorService.checkForDuplicateUsername.bind(this.validatorService)),
        "blog_title": new FormControl(this.user.blog_title),
        "description": new FormControl(this.user.description),
      });

      this.securityForm = new FormGroup({
        "email": new FormControl(this.user.email, [this.validatorService.required(), Validators.email], this.validatorService.checkForDuplicateEmail.bind(this.validatorService)),
        "passwords": new FormGroup({
          "password": new FormControl(this.new_password),
          "password2": new FormControl(this.new_password2, [Validators.min(8)])
        }, this.validatorService.passwordsMustMatch)
      });
    }
    else {
      localStorage.removeItem('current_user');
      this.router.navigate(['/users']);
    }
  }

  ngOnInit(): void {

  }

  get username() {
    return this.mainForm.get('username');
  }

  get email() { 
    return this.securityForm.get('email');
  }

  verifyPassword(): void {
    this
      .http
      .post<GenericResponse>(`${environment.server_url}/api/verify`, { id: this.user.user_id, password: this.password })
      .subscribe((data) => {
        if (data.success) {
          this.authorized = true;
        }
        else {
          console.log(data.message);
          console.log("could not authorize user.");
        }
      })
    ;
  }

  switchTheme(theme) {
    let headers = new HttpHeaders()
      .set("Authorization", `Bearer ${this.user.token}`)
    ;

    let theme_id: number;

    switch(theme) {
      case 'forest':
        theme_id = 2;
        break;
      case 'strawberry':
        theme_id = 3;
        break;
      case 'ruby':
        theme_id = 4;
        break;
      case 'aqua':
        theme_id = 5;
        break;
      default:
        theme_id = 1;
        break;
    }

    this
      .http
      .post<GenericResponse>(`${environment.server_url}/api/switch_theme`, { theme_id: theme_id}, { headers: headers})
      .subscribe((data) => {
        if (data.success) {
          this.user.theme = theme;
          localStorage.setItem("current_user", JSON.stringify(this.user));
        }
      })
    ;
  }

  updateImage(event): void {
    console.log(event.srcElement.files[0]);
    this.avatar = event.srcElement.files[0];

    let fileReader: FileReader = new FileReader();

    fileReader.onload = (e: FileReaderEvent): void => {
      console.log(e.target.result);
      this.user.avatar_small = e.target.result;
      this.user.avatar = e.target.result;
    };

    fileReader.readAsDataURL(this.avatar);
  }

  saveChanges(): void {
    let headers = new HttpHeaders()
      .set("Authorization", `Bearer ${this.user.token}`)
    ;

    let formData: FormData = new FormData();
    if (this.avatar) {
      formData.append('avatar', this.avatar);
    }

    formData.append('id', String(this.user.user_id));
    formData.append('blog_title', this.user.blog_title);
    formData.append('displayname', this.user.username);
    formData.append('description', this.user.description);

    this.saveSettings(formData);
  }

  saveSettings(postParams): void {
    let headers = new HttpHeaders()
      .set("Authorization", this.user.token)
    ;

    this
      .http
      .post<UpdateUserResponse>(`${environment.server_url}/api/update_user`, postParams, { headers: headers })
      .subscribe((data) => {
        if (data.success) {
          console.log('updated user successfully');
          this.user = data.user;
          localStorage.setItem("current_user", JSON.stringify(this.user));
          this.alertSuccess = true;
        }
        else {
          this.alertDanger = true;
          console.log(data.message);
        }
      })
    ;
  }

  saveSecurityChanges(): void {
    let headers = new HttpHeaders()
      .set("Authorization", this.user.token)
    ;

    let postParams: any = {
      id: this.user.user_id,
      email: this.user.email
    };

    if (this.new_password != '' && this.new_password2 != '') {
      postParams.password = this.new_password;
    }

    this.saveSettings(postParams);
  }



  ngDoCheck(): void {
    if (this.userDiffer.diff(this.user)) {
      this.updateUser.emit(this.user);
    }
  }

}
