import { Component, Inject, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";

export interface ClosableSnackData {
  message: string;
  action: string;
}

@Component({
  selector: 'app-closable-snack',
  templateUrl: './closable-snack.component.html',
  styleUrls: ['./closable-snack.component.scss']
})
export class ClosableSnackComponent implements OnInit {
  constructor(
      private snackBarRef: MatSnackBarRef<ClosableSnackComponent>,
      @Inject(MAT_SNACK_BAR_DATA) public data: ClosableSnackData) {

  }

  ngOnInit() {
  }

  onClose() {
    this.snackBarRef.dismiss();
  }

  onAction() {
    this.snackBarRef.dismissWithAction();
  }
}
