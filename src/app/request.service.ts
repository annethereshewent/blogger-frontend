import { Injectable } from '@angular/core';
import { Post } from '../classes/Post';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }

  posts: Post[];

  parseYoutubeURL(content) {
    var regEx = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = content.match(regEx);
    //the youtube id will be in match[7]. can verify with console.log
    //console.log(match);

    return match;
  }

  getYoutubeVideo(id) {
    if (id == '')
      return '';

    return '<div class="embed-responsive embed-responsive-16by9"><iframe src="https://www.youtube.com/embed/' + id + '" class="embed-responsive-item" frameborder="0" allowfullscreen></iframe></div>';
  }
}
