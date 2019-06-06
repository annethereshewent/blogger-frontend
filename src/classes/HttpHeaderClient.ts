import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { RequestService } from "../app/request.service";

@Injectable()
export class HttpHeaderClient {
  token: String;

  constructor(private http: HttpClient, private requestService: RequestService) {
    this.token = this.requestService.token ? this.requestService.token : JSON.parse(localStorage.getItem('user')).token
  }

  setHeaders() {
    return new HttpHeaders()
      .set('Authorization', `Bearer, ${this.token}`)
  }

  get(url) {
      const headers = this.setHeaders()

      return this
        .http
        .get(url, headers)
  }

  post(url, data) {
    const headers = this.setHeaders()

    return this
      .http
      .post(url, data, headers)
  }
}