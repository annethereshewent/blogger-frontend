import { Injectable, EventEmitter } from '@angular/core';
import { Post } from '../classes/Post';
import { Subject, BehaviorSubject } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { environment } from "../environments/environment";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient, private router: Router) { }

  posts: Post[];

  token: string

  private _sidebar_hidden: Subject<boolean> = new BehaviorSubject<boolean>(false);
  sidebar_hidden$ = this._sidebar_hidden.asObservable();

  private _dash_sidebar_active: Subject<boolean> = new BehaviorSubject<boolean>(false)
  dash_sidebar_active$ = this._dash_sidebar_active.asObservable()

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

  logout() {
    let token = this.token ? this.token : JSON.parse(localStorage.getItem('current_user')).token

    if (token) {
      this
        .http
        .post(`${environment.server_url}/oauth/revoke`, { token })
        .subscribe(() => {
          this.token = null
          localStorage.removeItem('current_user');
          this.router.navigate(["/users"]) 
        })  
    }
    
  }

  getYoutubeVideo(id) {
    if (id == '')
      return '';

    return '<div class="embed-responsive embed-responsive-16by9"><iframe src="https://www.youtube.com/embed/' + id + '" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe></div>';
  }

  toggleSidebar(hidden: boolean) {
    this._sidebar_hidden.next(hidden);
  }

  toggleDashSidebar(active: boolean) {
    this._dash_sidebar_active.next(active)
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
