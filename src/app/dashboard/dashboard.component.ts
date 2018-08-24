import { Component, OnInit, HostListener, IterableDiffers, IterableDiffer } from '@angular/core';
import { RequestService } from "../request.service";
import { PostsService } from "../posts.service";
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { YoutubeModalComponent } from "../youtube-modal/youtube-modal.component";
import { ImageModalComponent } from "../image-modal/image-modal.component";
import { trigger, state, style, animate, transition } from '@angular/animations';


declare var $: any;

interface PostInterface {
  success: boolean;
  message: string;
  posts: Post[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('simpleFadeAnimation', [
      state('in', style({opacity: 1})),

      transition("void => *", [
        style({ opacity: 0}),
        animate(600 )
      ]),

      transition("* => void", [
        animate(600, style({ opacity: 0}))
      ])
    ])
  ]
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
  iterableDiffer: IterableDiffer<any>;
  search_query: string = '';

  constructor(
    public requestService: RequestService,
    private postsService: PostsService,
    private router: Router, 
    private http: HttpClient, 
    private modalService: BsModalService, 
    private route: ActivatedRoute,
    private differs: IterableDiffers
  ) {
    
    

    // this.tag_name = this.route.snapshot.params.tag_name;
    // this.search_query = this.route.snapshot.params.search_term;

    let user = JSON.parse(localStorage.getItem('current_user'));
    if (!user) {
      this.router.navigate(["/users/login"]);
      return;
    }
    this.user = user;

    this.route.params.subscribe((params) => {
      console.log(params);
      if (params.search_term) {
        this.search_query = params.search_term;
      }
      if (params.tag_name) {
        this.tag_name = params.tag_name
      }
      this.iterableDiffer = differs.find([]).create(null);
      
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
      else if (this.search_query) {
        this.title = "Search Results:";
        //query the api for the search term
        let headers = new HttpHeaders()
          .set("Authorization", this.user.token)
        ;


        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/search/${this.search_query}`, { headers: headers})
          .subscribe((data) => {
            if (data.success) {
              data.posts = this.fixPosts(data.posts);
              console.log(data.posts);   

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
    });  
  }

  goToComments(post: Post) {
    this.router.navigate([`/blog/comments/${post.username}`, post.id])
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
    this
      .postsService
      .editPost(post)
      .subscribe((post) => {
        let index = this.posts.map((post) => { return post.id }).indexOf(post.id);

        let fixed_post = environment.production ? this.fixPosts([post])[0] : post;

        this.posts[index] = fixed_post;
      })
    ;
  }

  openYoutubeModal(): void {
    this.bsModalRef = this.modalService.show(YoutubeModalComponent, Object.assign({}, { class: "modal-md"}));
    this
      .bsModalRef
      .content
      .postEmitter
      .subscribe((post) => {
        this.posts.unshift(post);
      })
    ;
  }

  openImageModal(): void {
    this.bsModalRef = this.modalService.show(ImageModalComponent, Object.assign({}, { class: "modal-md"}));
    this.bsModalRef.content.postEmitter.subscribe((post) => {
      this.posts.unshift(post);
    })
  }

  openQuoteModal(post: Post): void {
    this
      .postsService
      .openQuoteModal(post)
      .subscribe((post) => {
        let fixed_post = this.fixPosts([post])[0];

        this.posts.unshift(fixed_post);
      })
    ;
  }

  deletePost(post: Post): void {
    this
      .postsService
      .deletePost(post, this.user.token)
      .then((success) => {
        this.posts.splice(this.posts.map((post) => { return post.id }).indexOf(post.id),1);
      })
      .catch((err) => console.log(err))
    ;
  }

  fixPosts(posts: Post[]): Post[] {
    if (environment.production) {
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
    }

    return posts;
  }

  openPostModal(): void {
    this
      .postsService
      .openPostModal()
      .subscribe((post) => {
        let fixed_post = environment.production ? post : this.fixPosts([post])[0];
        this.posts.unshift(fixed_post);
      })
    ;
  }

  openAccountPath(): void {
    this.router.navigate(["/blog/account"])
  }

  tagSearch(tag: string): void {
    this.router.navigate([`/users/tags/${tag}`]);
  }

  search(): void {
    this.router.navigate(['/users/search', this.search_query]);
  }

  ngOnInit() {
    // const initialState = { message, title };

    // let bsModalRef = this.modalService.show(ConfirmPopupComponent, Object.assign({}, this.modalConfig, { class: 'modal-sm', initialState })
    // );

  }

  ngDoCheck() {
    let changes = this.iterableDiffer.diff(this.posts);
    if (changes) {
      console.log('changes detected.');
      this.requestService.posts = this.posts;
    }
  }

}
