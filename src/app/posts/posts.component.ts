import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { Comment } from "../../classes/Comment";
import { Pagination } from "../../classes/Pagination";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";
import { PostsService } from "../posts.service";



interface UserPostResponse {
  success: boolean;
  message: string;
  user: User;
  posts: Post[];
  pagination: Pagination;
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  posts: Post[];
  current_user: User;
  username: string;
  user: User;

  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();
  @Output() pagination: EventEmitter<Pagination> = new EventEmitter<Pagination>();

  @HostBinding('class.active') is_active: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    public requestService: RequestService,
    private postsService: PostsService
  ) {
    let current_user: User;
    if (current_user = JSON.parse(localStorage.getItem("current_user"))) {
      this.current_user = current_user;
    }

    this
      .postsService
      .post$
      .subscribe((post) => {
        if (post != null) {
          this.posts.unshift(post);
        }
      })
    ;

    this.route.params.subscribe((params) => {
      console.log("something happened");
      let username = params.username;
      if (username) {
        if (username != this.username) {
          this.username = username;
        }
        let page = params.page;
        let url = `${environment.server_url}/api/fetch_blog_posts/${username}/${page}`;

        this
          .http
          .get<UserPostResponse>(url)
          .subscribe((data) => {
            if (data.success) {
              if (!this.user || (this.user.username != data.user.username)) {
                this.user = data.user;
                this.updateUser.emit(this.user);
              }

              this.posts = data.posts;
              
              this.pagination.emit(data.pagination);
            }
          })
        ;
      }
    })

    this.requestService.sidebar_hidden$.subscribe((active) => this.is_active = active);

    let user: User
    if (user = JSON.parse(localStorage.getItem('current_user'))) {
      this.current_user = user;
    }
  }

  goToComments(post: Post) {
    this.router.navigate([`/blog/comments/${this.username}/${post.id}`])
  }

  editPost(post) {
    this
      .postsService
      .editPost(post)
      .subscribe((post) => {
        let index = this.posts.map((post) => { return post.id }).indexOf(post.id);

        this.posts[index] = post;
      })
    ;
  }

  openQuoteModal(post) {
    this
      .postsService
      .openQuoteModal(post)
      .subscribe((post) => {
        this.posts.unshift(post);
      })
    ;
  }

  deletePost(post) {
    this
      .postsService
      .deletePost(post, this.user.token)
      .then((success) => {
        this.posts.splice(this.posts.map((post) => { return post.id }).indexOf(post.id),1);
      })
      .catch((err) => console.log(err))
    ;
  }

  ngOnInit() {
  }

}
