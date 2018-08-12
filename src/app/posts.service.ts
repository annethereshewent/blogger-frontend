import { Injectable, EventEmitter } from '@angular/core';
import { Post } from "../classes/Post";
import { PostModalComponent } from "./post-modal/post-modal.component";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject, BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  bsModalRef: BsModalRef;
  private _post: Subject<Post> = new BehaviorSubject<Post>(null);
  post$ = this._post.asObservable();

  constructor(private modalService: BsModalService, private http: HttpClient) { }

  openPostModal(): EventEmitter<Post> {
    let options  = {
      animated: true,
      class: 'modal-md',
    };
    this.bsModalRef = this.modalService.show(PostModalComponent,options);

    return this.bsModalRef.content.postEmitter;
  }

  openQuoteModal(post: Post): EventEmitter<Post> {
    let data: string;
    console.log(post);
    if (post.images.length > 0 ) {
      data = '<img src="' + post.images[0] + '"><p>Source: <a href="/posts/' + post.user_id + '">' + post.username + "</a></p>"
    }
    else {
      let avatar_src = environment.production ? post.avatar : `http://localhost:3000${post.avatar}`;
      let new_post = $("<div>").append(post.post);

      let before_contents: String = '';
      let after_contents: String = '';

      let num_quotes = $(new_post).find(".post-quote").length;

      if (num_quotes) {
        $(new_post).find(".post-quote").each(function(index) {
          console.log("it's going inside this loop");
          before_contents += "<div class='post-quote'>" + $(this).html() + "</div>";
          if (index == num_quotes-1) {
            after_contents = $(this).next().html();
          }
        });
      }
      else {
        before_contents = '';
        after_contents = post.post;
      }

      data = `${before_contents}<div class="post-quote"><img src="${avatar_src}" class="quote-avatar"><span>${post.username}</span><div class="quote-post">${after_contents}</div></div><p>`
    }

    console.log(data);

    let edited_post: Post = {
      id: post.id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      post: data,
      edited: post.edited,
      num_comments: post.num_comments,
      avatar: post.avatar,
      username: post.username,
      images: post.images,
      user_id: post.user_id,
      tags: post.tags
    };

    let initialState = {
      post: edited_post,
      type: "quote"
    };

    this.bsModalRef = this.modalService.show(PostModalComponent, Object.assign({}, { class: "modal-md", initialState } ));
    
    return this.bsModalRef.content.postEmitter;
  }

  deletePost(post: Post, token): void {
    return new Promise((resolve, reject) => {
      if (confirm("Are you sure you want to delete this post?")) {
        let headers = new HttpHeaders()
          .set("Authorization", token)
        ;

        this
          .http
          .post<DeleteResponse>(`${environment.server_url}/api/delete_post/${post.id}`, {}, { headers: headers })
          .subscribe((data) => {
            if (data.success) {
              resolve(true);
            }
            else {
              reject(data.message);
            }
          })
        ;  
      }
      else {
        reject("user_cancelled");
      }  
    })
    
    
  }

  editPost(post: Post): EventEmitter<Post> {
    let options  = {
      animated: true,
      class: 'modal-md',
    };

    let initialState = {
      post: post,
      type: "edit",
      edit_tags: post.tags
    };

    this.bsModalRef = this.modalService.show(PostModalComponent,Object.assign({}, { class: "modal-md", initialState } ));
    return this.bsModalRef.content.postEmitter;
  }

  addPost(post: Post) {
    this._post.next(post);
  }
}
