import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from "../environments/environment";
import { User } from "../classes/User";

declare var $: any;

interface DuplicateInterface {
  duplicate: Boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  private debounceTimeout;

  constructor(private http: HttpClient) {

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

  alphanumeric_plus() {

    let regex = /^[A-Za-z0-9]([A-Za-z0-9_-]*[A-Za-z0-9])?$/;

    return (control: FormControl): any => {
      if (control.value != '' && !regex.test(control.value)) {
        return {
          alphanumeric_plus: {
            value: control.value
          }
        }
      }

      return null;
    }
  }

  required_html() {
    return (control: FormControl): any => {
      if ($("<div>").html(control.value).text().trim() == '') {
        return {
          required: {
            value: control.value
          }
        }
      }

      return null;

    }
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

  spaces() {
    return (control: FormControl): any => {
      if (control.value.indexOf(' ') != -1) {
        return {
          spaces: {
            value: control.value
          }
        };
      }
    }
  }

  checkForDuplicateUsername(control: FormControl) {

    return this.checkForDuplicate(`${environment.server_url}/api/find_user`, {
      username: control.value
    }, control.value); 
    
  }

  checkForDuplicateEmail(control: FormControl) {
    return this.checkForDuplicate(`${environment.server_url}/api/find_email`, {
      email: control.value
    }, control.value);  
  }

  checkForDuplicate(url, postParams, value) {
    let user: User;
    clearTimeout(this.debounceTimeout);

    return new Promise((resolve, reject) => {
      let compare_value;

      if (user = JSON.parse(localStorage.getItem('current_user'))) {
        compare_value = postParams.email ? user.email : user.username
      }
      else {
        compare_value = '';
      }

      if (value != '' &&  value != compare_value) {
        this.debounceTimeout = setTimeout(() => {
          this
            .http
            .post<DuplicateInterface>(url, postParams)
            .subscribe((data) => {
              if (data.duplicate) {
                resolve({
                  duplicate: {
                    value: value
                  }
                });
              }
              else {
                resolve(null);
              }
            })
        }, 600);
      }
      else {
        resolve(null);
      }
    }); 
  }
}
