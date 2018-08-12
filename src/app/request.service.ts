import { Injectable } from '@angular/core';
import { Post } from '../classes/Post';
import { Subject, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }

  posts: Post[];

  private _posts: Subject<Post[]> = new BehaviorSubject<Post[]>(this.posts);
  posts$ = this._posts.asObservable();

  parseYoutubeURL(content) {
    var regEx = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = content.match(regEx);
    //the youtube id will be in match[7]. can verify with console.log
    //console.log(match);

    if (match) {
      return match[7];
    }

    return null;
  }

  getYoutubeVideo(id) {
    if (id == '')
      return '';

    return '<div class="embed-responsive embed-responsive-16by9"><iframe src="https://www.youtube.com/embed/' + id + '" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe></div>';
  }

  addPosts(posts: Post[]) {
    this._posts.next(posts);
  }

  getCommentText(post) {
    if (post.num_comments == 0) {
      return "Comments";
    }
    else if (post.num_comments == 1) {
      return "1 Comment";
    }
    else {
      return `${post.num_comments} Comments`;
    }
  }
}
