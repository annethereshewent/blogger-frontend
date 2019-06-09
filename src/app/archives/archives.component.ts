import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { Router, ActivatedRoute } from '@angular/router';
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { PostsService } from "../posts.service";

interface ArchiveInterface {
  success: boolean,
  message: string,
  posts: Post[],
  options: any[]
}
interface PostsInterface {
  success: boolean,
  message: string,
  posts: Post[]
}
@Component({
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  current_user: User;
  posts: Post[];
  options: any[];
  production: boolean = environment.production;

  username: string

  constructor(private http: HttpClient, public router: Router, private route: ActivatedRoute, private postsService: PostsService) {
    this.current_user = JSON.parse(localStorage.getItem('current_user'))

    if (this.current_user) {
      this.route.params.subscribe((params) => {
        this.username = params.username
        this
          .http
          .get<ArchiveInterface>(`${environment.server_url}/api/archive/${this.username}`)
          .subscribe((data) => {
            if (data.success) {
              this.posts = this.postsService.fixPosts(data.posts)
              this.options = data.options
            }
          })   
      })
      
    }
    else {
      this.router.navigate(['/users'])
    }
    
  }

  getArchivePosts(date: string) {
    this
      .http
      .post<PostsInterface>(`${environment.server_url}/api/fetch_archive_posts/${this.username}`, { date })
      .subscribe((data) => {
        if (data.success) {
          this.posts = this.postsService.fixPosts(data.posts)
        }
      })
  }

  goToPost(post: Post) {
    this.router.navigate([`/blog/comments/${this.username}/${post.id}`])
  }

  goToDashboard() {
    this.router.navigate(['/users/dashboard'])
  }

  logout() {
    this.requestService.logout()
  }

  ngOnInit() {
  }

}
