import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NamespaceServiceService } from '../../../api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-namespace-dialog',
  templateUrl: './create-namespace-dialog.component.html',
  styleUrls: ['./create-namespace-dialog.component.scss']
})
export class CreateNamespaceDialogComponent implements OnInit {
  namespaceInput: FormControl;
  sourceNamespace = '';

  creatingNamespace = false;
  error = null;

  constructor(
      private namespaceService: NamespaceServiceService,
      public dialogRef: MatDialogRef<CreateNamespaceDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
    this.namespaceInput = new FormControl('');
    this.namespaceInput.setValidators([
        Validators.required
    ]);

    this.sourceNamespace = data.sourceNamespace;
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  create() {
    const newNamespace = this.namespaceInput.value;
    if (newNamespace === '') {
      this.namespaceInput.setErrors({error: 'Must not be blank'});
      return;
    }

    this.creatingNamespace = true;

    this.namespaceService.createNamespace({
      name: newNamespace,
      sourceName: this.sourceNamespace
    }).subscribe(res => {
          this.creatingNamespace = false;
          this.dialogRef.close(newNamespace);
      }, (err: HttpErrorResponse)  => {
          console.log(err);
          this.namespaceInput.setErrors({error: err.error.message});
          this.creatingNamespace = false;
      }
    );
  }
}
