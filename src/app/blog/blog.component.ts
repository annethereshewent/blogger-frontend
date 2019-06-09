import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { Pagination } from "../../classes/Pagination";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestService } from "../request.service";
import { PostsService } from "../posts.service";

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
  pagination: Pagination;
  username: string = '';
  theme: string = 'default';

  constructor(
    public sanitizer: DomSanitizer, 
    public router: Router, 
    public requestService: RequestService,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
  
    this.current_user = JSON.parse(localStorage.getItem('current_user'));
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
    this.requestService.logout()
  }

  goToDashboard() {
    this.router.navigate(['/users/dashboard'])
  }

  show_requests(): boolean {
    return true;
  }

  check_requests(): string {
    return '';
  }


  navigateNextPage() {
    this.router.navigate([`/blog/posts/${this.user.username}`, this.pagination.next_page]);
  }

  navigatePreviousPage() {
    this.router.navigate([`/blog/posts/${this.user.username}`, this.pagination.prev_page]);
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

  is_friends(): boolean {
    return false;
  }

  openPostModal(): void {
    this
      .postsService
      .openPostModal()
      .subscribe((post) => {
        this.postsService.addPost(post);
      })
    ;
  }

  onActivate(component): void {
    if (component.updateUser) {
      component.updateUser.subscribe((user) => {
        let user_undefined = this.user == undefined;
        this.user = user;
        if (user_undefined) {
          this.cdRef.detectChanges();
        }
        if (this.theme != user.theme) {
          this.theme = user.theme;
          // this gets the job done! we can keep this as a single page app and remove the db code from express
          $("#blog-stylesheet").attr("href", `/assets/themes/${this.theme}.css`);
        }
      })
    }
    if (component.pagination) {
      component.pagination.subscribe((pagination) => {
        this.pagination = pagination;
      })
    }
  }


}
