import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";


@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  user: User;
  posts: Post[];

  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    private requestService: RequestService
  ) { 
    this.requestService.posts$.subscribe((posts) => { 
      this.posts = posts;
      console.log(this.posts);
    });
  }

  ngOnInit() {
  }

}
