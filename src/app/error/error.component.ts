import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  errorCode = '';
  errorMessage = '';

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(next => {
      this.errorCode = next.get('code');
      console.log(this.errorCode);

      switch (this.errorCode) {
        case '403':
          this.errorMessage = 'You do not have permission to view this page';
          break;
        default:
          this.errorMessage = 'Unknown error';
      }

    });
  }

}
