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
  token: string = null;
  constructor(private requestService: RequestService) {
    this.fetch_token()
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.fetch_token()
    // Clone the request to add the new header
    
    if (this.token) {
      const clonedRequest = req.clone({ headers: req.headers.set('Authorization', `Bearer ${this.token}`) });
      return next.handle(clonedRequest)  
    }
    else {
      return next.handle(req)
    }
  }

  fetch_token() {
    if (!this.token) {
      let user = null
      if (this.requestService.token) {
        this.token = this.requestService.token

        return true
      }
      if (user = JSON.parse(localStorage.getItem('current_user'))) {
        this.token = user.token

        return true
      }

      this.token = null
      return false 
    }

    return true
    
  }
}