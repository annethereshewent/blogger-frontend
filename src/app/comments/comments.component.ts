import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { Comment } from "../../classes/Comment";
import { HttpClient } from '@angular/common/http';
import { RequestService } from "../request.service";
import { environment } from "../../environments/environment";

interface CommentsResponse {
  success: boolean;
  message: string;
  post: Post;
  comments: Comment[];
  user: User;
}

interface CommentsPostResponse {
  success: boolean;
  message: string;
  comment: Comment;
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
  show_new_comments = false;
  user: User;
  new_comment: string;
  @HostBinding('class.active') is_active: boolean = false;
  show_reply: boolean[];
  reply_comment: string[];
  production = environment.production;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private http: HttpClient,
    private requestService: RequestService
  ) {

    this.comments = [];

    this.requestService.sidebar_hidden$.subscribe((active) => this.is_active = active);

    let username = this.route.snapshot.params.username;
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

          this.show_reply = [];
          this.reply_comment = [];

          for (let i = 0; i < data.comments.length; i++) {
            this.show_reply.push(false);
            this.reply_comment.push('');
          }
        }
      })
    ;
  }

  goToBlog(username: string) {
    let url = `/blog/posts/${username}`

    if (username != this.current_user.username) {
      if (environment.production) {
        console.log('it should be going in here')
        location.href = url
      }
      else {
        this.router.navigate([url])
      }
    }
    else {
      this.router.navigate([url])
    }
    
  }

  openReply(index: number): void {
    this.show_reply[index] = true;
  }

  ngOnInit() {
  }

  submit(postParams, callback): void {
    if (this.current_user) {
      this
        .http
        .post<CommentsPostResponse>(`${environment.server_url}/api/post_comment`, postParams)
        .subscribe((data) => {
          if (data.success) {
            callback(data.comment);
          }
          else {
            console.log(data.message);
          }
        })
      ;
    }  
  }

  submitComment(): void {
    this.submit({ 
      comment: this.new_comment,
      parent: 0,
      pid: this.post.id,
      indentLevel: 0
    }, (comment: Comment) => {
      this.comments.push(comment);
      this.show_new_comments = false;
    });
  }

  replyToComment(i: number) {
    this.submit({
      comment: this.reply_comment[i],
      parent: this.comments[i].id,
      pid: this.post.id,
      indentLevel: this.comments[i].indentLevel+1
    }, (comment: Comment) => {
      this.show_reply[i] = false;
      let index: number = -1;

      for (let i = 0; i < this.comments.length; i++) {
        if (this.comments[i].id == comment.parent) {
          index = i;
        }
        else if (this.comments[i].parent == comment.parent) {
          index = i;
        }
      }

      if (index == this.comments.length-1) {
        this.comments.push(comment);
      }
      else {
        this.comments.splice(index+1, 0, comment);
      }
    })
  }

  getMargins(comment): string {
    return (comment.indentLevel) * 15 + "px";
  }

  goBack() {
    this.router.navigate([`/blog/posts/${this.user.username}/1`]);
  }

}
