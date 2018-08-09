import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  theme: string = "/assets/theme/default.css";
  user: User;
  current_user: User;
  production: boolean = environment.production;



  constructor(public sanitizer: DomSanitizer, public router: Router, private requestService: RequestService) {
    let current_user: User;
    if (current_user = JSON.parse(localStorage.getItem("current_user"))) {
      this.current_user = current_user;
      if (this.router.url == "/blog/account") {
        this.user = this.current_user;
      }
    }
    else if (this.router.url == '/blog/account') {
      localStorage.removeItem("current_user");
      this.router.navigate(["/users"])
    }

  }

  ngOnInit() {
  }

  logout() {
    localStorage.removeItem("current_user");
    this.router.navigate(["/users"]);
  }

  show_requests(): boolean {
    return true;
  }

  check_requests(): string {
    return '';
  }

  onActivate(component) {
    if (component.updateUser) {
      component.updateUser.subscribe((user) => {
        this.user = user;
      })
    }
  }

  
}