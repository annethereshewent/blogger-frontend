import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { RequestService } from "../app/request.service";
import { Observable, throwError } from 'rxjs';
import { Injectable } from "@angular/core";
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
export class AddHttpInterceptor implements HttpInterceptor {
  constructor(private requestService: RequestService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.fetch_token()
    // Clone the request to add the new header  
    if (token) {
      const clonedRequest = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
      return next.handle(clonedRequest).pipe(catchError((error) => {
        if (error.status == 401) {
          this.requestService.logout()
          return throwError("Invalid token")
        }

        return throwError("An unknown error has occurred")
      }))  
    }
    else {
      return next.handle(req).pipe(catchError((error) => {
        if (error.status == 401) {
          if (this.router.url != '/users') {
            this.router.navigate(['/users'])  
          }
          return throwError("Unauthorized")
        }
        return throwError("An unknown error has occurred")
      }))
    }
  }

  fetch_token() {
    let user = null
    if (this.requestService.token) {
      return this.requestService.token
    }
    if (user = JSON.parse(localStorage.getItem('current_user'))) {
      return user.token
    }

    return false
  }
}