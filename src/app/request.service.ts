import { Injectable } from '@angular/core';
import { Post } from '../classes/Post';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }

  posts: Post[];
}
