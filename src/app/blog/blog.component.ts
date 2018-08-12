import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestService } from "../request.service";

declare var $: any;


interface CommentsResponse {
  success: boolean;
  message: string;
  user: User;
  post: Post;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  user: User;
  current_user: User;
  production: boolean = environment.production;
  sidebar_button_class: string = "fa fa-caret-square-o-left";
  sidebar_hidden: boolean = false;
  is_mobile: boolean = false;
  page: number = null;
  prev_page: number = null;
  next_page: number = null;
  username = '';



  constructor(
    public sanitizer: DomSanitizer, 
    public router: Router, 
    private route: ActivatedRoute,
    private requestService: RequestService,
    private http: HttpClient
  ) {
    
    if (this.router.url == "/blog/account") {
      let current_user: User; 
      if (current_user = JSON.parse(localStorage.getItem("current_user"))) {
        console.log('it went here.');
        this.current_user = current_user;
        this.user = current_user;
      }
      else {
        localStorage.removeItem("current_user");
        this.router.navigate(["/users"]);
      }
    }
  }

  ngOnInit(): void {
    $(window).resize(() => {
      if ($(window).width() < 992) {
        this.is_mobile = true;
        this.sidebar_button_class = this.sidebar_hidden ? "fa fa-caret-square-o-left" : "fa fa-caret-square-o-right";
      }
      else if ($(window).width() > 991.998) {
        this.is_mobile = false;
        this.sidebar_button_class = this.sidebar_hidden ? "fa fa-caret-square-o-right" : "fa fa-caret-square-o-left";
      }
    });
  }

  logout(): void {
    localStorage.removeItem("current_user");
    this.router.navigate(["/users"]);
  }

  show_requests(): boolean {
    return true;
  }

  check_requests(): string {
    return '';
  }


  navigateNextPage() {
    this.router.navigate([`/blog/posts/${this.user.username}`, this.next_page]);
  }

  navigatePreviousPage() {
    this.router.navigate([`/blog/posts/${this.user.username}`, this.prev_page]);
  }

  toggleSidebar(): void {
    if (this.is_mobile) {
      this.sidebar_button_class = this.sidebar_hidden ? "fa fa-caret-square-o-right" : "fa fa-caret-square-o-left";
    }
    else {
      this.sidebar_button_class = this.sidebar_hidden ? "fa fa-caret-square-o-left" : "fa fa-caret-square-o-right";
    }
    this.sidebar_hidden = this.sidebar_hidden ? false : true;
    this.requestService.toggleSidebar(this.sidebar_hidden);
  }

  is_friends() {
    return false;
  }

  onActivate(component) {
    if (component.updateUser) {
      component.updateUser.subscribe((user) => {
        this.user = user;
      })
    }
    if (component.pagination) {
      component.pagination.subscribe((pagination) => {
        this.next_page = pagination.next_page;
        this.prev_page = pagination.prev_page;
        this.page = pagination.page;
      })
    }
  }


}
