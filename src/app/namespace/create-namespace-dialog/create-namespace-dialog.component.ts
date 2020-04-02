import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-create-namespace-dialog',
  templateUrl: './create-namespace-dialog.component.html',
  styleUrls: ['./create-namespace-dialog.component.scss']
})
export class CreateNamespaceDialogComponent implements OnInit {
  namespaceInput: FormControl;


  constructor(public dialogRef: MatDialogRef<CreateNamespaceDialogComponent>,) {
    this.namespaceInput = new FormControl('');
    this.namespaceInput.setValidators([
        Validators.required
    ]);
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  create() {
    this.dialogRef.close(this.namespaceInput.value);
  }
}
