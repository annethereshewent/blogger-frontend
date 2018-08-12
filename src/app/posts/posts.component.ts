import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";

interface UserPostsResponse {
  success: boolean;
  message: string;
  user: User;
  posts: Post[];
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  user: User;
  posts: Post[];

  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { 
    let username: string = this.route.snapshot.params.username
    if (username) {
      this
        .http
        .get<UserPostResponse>(`${environment.server_url}/api/fetch_blog_posts/${username}`)
        .subscribe((data) => {
          if (data.success) {
            this.user = data.user;
            this.posts = data.posts;
            this.updateUser.emit(data.user);
          }
        })
      ;
    }
  }

  ngOnInit() {
  }

}
