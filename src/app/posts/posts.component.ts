import { Component, OnInit, Output, EventEmitter, HostBinding } from '@angular/core';
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

  posts: Post[];
  current_user: User;

  @Output() updateUser: EventEmitter<User> = new EventEmitter<User>();
  @HostBinding('class.active') is_active: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient,
    public requestService: RequestService
  ) { 
    this.requestService.posts$.subscribe((posts) => { 
      this.posts = posts;
      console.log(this.posts);
    });

    this.requestService.sidebar_hidden$.subscribe((active) => this.is_active = active);

    let user: User
    if (user = JSON.parse(localStorage.getItem('current_user'))) {
      this.current_user = user;
    }
  }

  ngOnInit() {
  }

}
