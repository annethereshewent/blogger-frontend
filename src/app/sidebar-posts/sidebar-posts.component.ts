import { Component, OnInit, Input, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";
import { PostsService } from "../posts.service";
import { Pagination } from '../../classes/Pagination' 

interface PostInterface {
  success: boolean,
  posts: Post[],
  pagination: Pagination
}

@Component({
  selector: 'app-sidebar-posts',
  templateUrl: './sidebar-posts.component.html',
  styleUrls: ['./sidebar-posts.component.scss']
})
export class SidebarPostsComponent implements OnInit {
  @Input() set user(value: User) {
    this._user = value

    this.posts = []
    this.page = 1

    this.fetch_user_posts()
  };
  @Input() current_user: User;
  _user: User
  page: number = 1;
  production: boolean = environment.production
  loading_posts: boolean = false
  finished_loading_posts: boolean = false

  posts: Post[];

  constructor(private http: HttpClient, public requestService: RequestService, private postsService: PostsService) { }

  @HostListener("window:  scroll", ["$event"])
  onScroll(): void {
    let sidebar = document.getElementById('sidebar')
    if (sidebar.offsetHeight + sidebar.scrollTop >= sidebar.scrollHeight && !this.loading_posts && !this.finished_loading_posts) {
      this.fetch_user_posts()
    }
  }

  fetch_user_posts() {
    this.loading_posts = true
    this
      .http
      .get<PostInterface>(`${environment.server_url}/api/fetch_blog_posts/${this._user.username}/${this.page}`)
      .subscribe((data) => {
        this.loading_posts = false
        if (data.success) {
          let pagination: Pagination = data.pagination

          if (!pagination.next_page) {
            this.finished_loading_posts = true
          } 
          if (!environment.production) {
            data.posts = this.postsService.fixPosts(data.posts)
          }
          if (this.page == 1) {
            this.posts = data.posts
          }
          else {
            this.posts.push.apply(this.posts, data.posts)
          }
          this.page++  
        }
      })  
  }

  ngOnInit() {
  }

}
