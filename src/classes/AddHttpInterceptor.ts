import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { RequestService } from "../app/request.service";
import { Observable } from 'rxjs';
import { Injectable } from "@angular/core";

@Injectable()
export class AddHttpInterceptor implements HttpInterceptor {
  constructor(private requestService: RequestService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.fetch_token()
    // Clone the request to add the new header  
    if (token) {
      const clonedRequest = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
      return next.handle(clonedRequest)  
    }
    else {
      return next.handle(req)
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