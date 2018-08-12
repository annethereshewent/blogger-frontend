import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestService } from "../request.service";

declare var $: any;

interface UserPostResponse {
  success: boolean;
  message: string;
  user: User;
  posts: Post[];
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
        this.current_user = current_user;
        this.user = current_user;
      }
      else {
        localStorage.removeItem("current_user");
        this.router.navigate(["/users"]);
      }
    }
    else {
      let username = this.route.snapshot.firstChild.params.username;
      if (username) {
        let current_user: User;
        if (current_user = JSON.parse(localStorage.getItem("current_user"))) {
          this.current_user = current_user;
        }

        this
          .http
          .get<UserPostResponse>(`${environment.server_url}/api/fetch_blog_posts/${username}`)
          .subscribe((data) => {
            if (data.success) {
              this.user = data.user;
              this.requestService.addPosts(data.posts);
            }
          })
        ;
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
  }


}
