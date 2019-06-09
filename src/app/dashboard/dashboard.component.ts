import { Component, OnInit, HostListener, IterableDiffers, IterableDiffer } from '@angular/core';
import { RequestService } from "../request.service";
import { PostsService } from "../posts.service";
import { Post } from "../../classes/Post";
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { HttpClient } from '@angular/common/http';
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
  sidebar_user: User;
  production_site: Boolean = environment.production;
  page: number = 2;
  loading_posts: boolean = false;
  bsModalRef: BsModalRef;
  tag_name: string;
  title: string = "Feed Posts:"
  iterableDiffer: IterableDiffer<any>;
  search_query: string = '';
  sidebar_active: boolean = false

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
      if (params.search_term) {
        this.search_query = params.search_term;
      }
      if (params.tag_name) {
        this.tag_name = params.tag_name
      }

      this.iterableDiffer = differs.find([]).create(null);
      
      if (this.tag_name) {
        this.title = "Tag Search:";

        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/tag_search/${this.tag_name}`)
          .subscribe((data) => {
            if (data.success) {
              if (!environment.production) {
                data.posts = this.postsService.fixPosts(data.posts);
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

        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/search/${this.search_query}`)
          .subscribe((data) => {
            if (data.success) {
              data.posts = this.postsService.fixPosts(data.posts);   

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

          this
            .http
            .get<PostInterface>(`${environment.server_url}/api/fetch_posts`)
            .subscribe((data) => {
              if (data.success) {
                if (!environment.production) {
                  data.posts = this.postsService.fixPosts(data.posts);  
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
    this.router.navigate([`/blog/comments/${post.username}/${post.id}`])    
  }

  @HostListener("window:  scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.tag_name && !this.search_query && !this.loading_posts) {

      if (this.user) {
        this.loading_posts = true;
        this
          .http
          .get<PostInterface>(`${environment.server_url}/api/fetch_posts/${this.page}`)
          .subscribe((data) => {
            if (data.success) {
              if (!environment.production) {
                data.posts = this.postsService.fixPosts(data.posts);
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

        let fixed_post = environment.production ? this.postsService.fixPosts([post])[0] : post;

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

  resetSidebarUser(user) {
    this.sidebar_user = user
  }

  updateSidebarUser(user) {
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i].user.user_id == user.user_id) {
        this.posts[i].user = user
      }
    }
  }
  @HostListener('document:click', ['$event']) clickout(event) {
    // Click outside of sidebar detected
    this.requestService.toggleDashSidebar(false)
    setTimeout(() => {
      this.sidebar_user = null
    }, 1000)
  }

  toggleSidebar(user: User, event) {
    event.stopPropagation()
    if (!this.sidebar_user || this.sidebar_user.user_id != user.user_id) {
      let cloned_user = JSON.parse(JSON.stringify(user))

      if (!environment.production) {
        let data_regex = /^data:image\/.*;base64.*/
        let host_regex = /^http:\/\/localhost:3000.*/
        if (!data_regex.test(cloned_user.avatar_small) && !host_regex.test(cloned_user.avatar_small)) {
          cloned_user.avatar_small = 'http://localhost:3000' + cloned_user.avatar_small  
        }
        if (!data_regex.test(cloned_user.banner) && !host_regex.test(cloned_user.banner)) {
          cloned_user.banner = 'http://localhost:3000' + cloned_user.banner 
        }  
      }

      this.sidebar_user = cloned_user

      setTimeout(() => {
        this.requestService.toggleDashSidebar(true)
      }, 300)
      
    }
    else {
      this.requestService.toggleDashSidebar(false)
      setTimeout(() => {
        this.sidebar_user = null  
      }, 1000) 
    }
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
        let fixed_post = this.postsService.fixPosts([post])[0];

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

  openPostModal(): void {
    this
      .postsService
      .openPostModal()
      .subscribe((post) => {
        let fixed_post = environment.production ? post : this.postsService.fixPosts([post])[0];
        this.posts.unshift(fixed_post);
      })
    ;
  }

  openAccountPath(): void {
    if (this.user) {
      this.router.navigate([`/blog/account/${this.user.username}`])
    }
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
      this.requestService.posts = this.posts;
    }
  }
}
