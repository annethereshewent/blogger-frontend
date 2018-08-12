import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { Comment } from "../../classes/Comment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestService } from "../request.service";
import { environment } from "../../environments/environment";

interface CommentsResponse {
  success: boolean;
  message: string;
  post: Post;
  comments: Comment[];
  user: User;
}

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  post: Post;
  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();
  comments: Comment[];
  current_user: User;
  user: User;
  @HostBinding('class.active') is_active: boolean = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient,
    private requestService: RequestService
  ) {
    this.requestService.sidebar_hidden$.subscribe((active) => this.is_active = active);
    console.log('test??');
    let username = this.route.snapshot.params.username;
    console.log(username);
    let post_id = this.route.snapshot.params.post_id;

    this.current_user = JSON.parse(localStorage.getItem("current_user"));
    this
      .http
      .get<CommentsResponse>(`${environment.server_url}/api/fetch_comments/${post_id}?username=${username}`)
      .subscribe((data) => {
        if (data.success) {
          this.post = data.post;
          this.user = data.user;
          this.updateUser.emit(data.user);
          this.comments = data.comments;
        }
      })
    ;
  }

  ngOnInit() {
  }

  getMargins(comment): string {
    console.log(comment.indentLevel);
    return (comment.indentLevel) * 15 + "px";
  }

  postNewComment(): void {

  }

  goBack() {
    this.router.navigate([`/blog/posts/${this.user.username}/1`]);
  }

}
