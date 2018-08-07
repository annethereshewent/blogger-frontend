import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {

  constructor(private router: Router) {
    console.log(this.router.url.indexOf('/users/tags'));
  }

  ngOnInit() {

  }

  dashboardPath() {
    this.router.navigate(['/users/dashboard']);
  }

}
