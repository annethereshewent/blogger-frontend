import { Component, OnInit, HostListener } from '@angular/core';
import { RequestService } from "../request.service";
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PostModalComponent } from "../post-modal/post-modal.component";
import { YoutubeModalComponent } from "../youtube-modal/youtube-modal.component";
import { ImageModalComponent } from "../image-modal/image-modal.component";


declare var $: any;

interface PostInterface {
  success: boolean;
  message: string;
  posts: Post[];
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  posts: Post[];
  user: User;
  production_site: Boolean = environment.production;
  page: number = 2;
  loading_posts = false;
  bsModalRef: BsModalRef;
  tag_name: string;
  title: string = "Feed Posts:"

  constructor(
    private requestService: RequestService, 
    private router: Router, 
    private http: HttpClient, 
    private modalService: BsModalService, 
    private route: ActivatedRoute
  ) {
    
    this.tag_name = this.route.snapshot.params.tag_name;

    let user = JSON.parse(localStorage.getItem('current_user'));
    if (!user) {
      this.router.navigate(["/users/login"]);
      return;
    }
    this.user = user;
    if (this.tag_name) {
      this.title = "Tag Search:";

      let headers = new HttpHeaders()
        .set("Authorization", this.user.token)
      ;

      this
        .http
        .get<PostInterface>(`${environment.server_url}/api/tag_search/${this.tag_name}`, { headers: headers})
        .subscribe((data) => {
          if (data.success) {
            if (!environment.production) {
              data.posts = this.fixPosts(data.posts);
            }
            this.posts = data.posts;

          }
          else {
            console.log(data.message);
          }
        })
      ;


    }
    else {
      this.title = "Feed Posts:"
      if (requestService.posts) {
        this.posts = requestService.posts
      }
      else {
        console.log("posts not found in memory, making a request to backend for them");

        const headers = new HttpHeaders()
          .set("Authorization", user.token)
        ;

        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/fetch_posts`, { headers: headers })
          .subscribe((data) => {
            if (data.success) {
              if (!environment.production) {
                data.posts = this.fixPosts(data.posts);  
              }
              
              this.posts = data.posts


            }
            else {
              //token is invalid now, for some reason. redirect back to login page
              localStorage.removeItem("current_user");
              this.user = null;
              this.router.navigate(["/users/login"])
            }
          })
        ;
      }  
    }

    
  }


  logout(): void {
    localStorage.removeItem('current_user');
    this.router.navigate(["/users"])
  }

  @HostListener("window:  scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.tag_name && !this.loading_posts) {
      console.log('youve reached the bottom of the page!');

      if (this.user) {
        let headers = new HttpHeaders()
          .set("Authorization", this.user.token)
        ;

        this.loading_posts = true;
        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/fetch_posts/${this.page}`, { headers: headers })
          .subscribe((data) => {
            if (data.success) {
              if (!environment.production) {
                this.fixPosts(data.posts);
              }
              this.posts.push.apply(this.posts, data.posts);
              this.page++;
              this.loading_posts = false;
            }
          })
        ;  
      }
      
    }
  }

  editPost(post: Post): void {
    let options  = {
      animated: true,
      class: 'modal-md',
    };

    let initialState = {
      post: post,
      type: "edit"
    };

    this.bsModalRef = this.modalService.show(PostModalComponent,Object.assign({}, { class: "modal-md", initialState } ));
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      let index = this.posts.map((post) => { return post.id }).indexOf(post.id);

      let fixed_post = this.fixPosts([post])[0];

      this.posts[index] = fixed_post;
    });
  }

  openYoutubeModal(): void {
    this.bsModalRef = this.modalService.show(YoutubeModalComponent, Object.assign({}, { class: "modal-md"}));
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      this.posts.unshift(post);
    })
  }

  openImageModal(): void {
    this.bsModalRef = this.modalService.show(ImageModalComponent, Object.assign({}, { class: "modal-md"}));
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      this.posts.unshift(post);
    })
  }

  openQuoteModal(post: Post): void {
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
      user_id: post.user_id
    };

    let initialState = {
      post: edited_post,
      type: "quote"
    };

    this.bsModalRef = this.modalService.show(PostModalComponent, Object.assign({}, { class: "modal-md", initialState } ));
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      let fixed_post = this.fixPosts([post])[0];

      this.posts.unshift(fixed_post);
    })
  }

  deletePost(post: Post): void {
    if (confirm("Are you sure you want to delete this post?")) {
      let headers = new HttpHeaders()
        .set("Authorization", this.user.token)
      ;

      this
        .http
        .post<DeleteResponse>(`${environment.server_url}/api/delete_post/${post.id}`, {}, { headers: headers })
        .subscribe((data) => {
          if (data.success) {
            //remove the post from the posts array
            this.posts.splice(this.posts.map((post) => { return post.id }).indexOf(post.id),1);
          }
          else {
            console.log(data.message);
          }
        })
      ;  
    }
    
  }

  fixPosts(posts: Post[]): Post[] {
    posts = posts.map((post: Post): Post => {
      let post_selector = $("<div>").append(post.post);
      $(post_selector).find( "img").each(function() {
        let img_src = $(this).attr("src");
        if (img_src.charAt(0) == "/") {
          $(this).attr("src", "http://localhost:3000" + img_src);
        }
      });

      // $(post_selector).find("iframe").each(function() {
      //   $(this).addClass("embed-responsive-item");
      //   $(this).wrap("<div class='embed-responsive embed-responsive-16by9'></div>");
      // });

      post.post = $(post_selector).html();


      return post;
    });

    return posts;
  }

  openPostModal(): void {
    let options  = {
      animated: true,
      class: 'modal-md',
    };
    this.bsModalRef = this.modalService.show(PostModalComponent,options);
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      console.log("hey, it worked!");
      let fixed_post = this.fixPosts([post])[0];
      this.posts.unshift(fixed_post);

    })

  }

  tagSearch(tag: string) {
    this.router.navigate([`/users/tags/${tag}`]);
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

  ngOnInit() {
    // const initialState = { message, title };

    // let bsModalRef = this.modalService.show(ConfirmPopupComponent, Object.assign({}, this.modalConfig, { class: 'modal-sm', initialState })
    // );

  }

}
