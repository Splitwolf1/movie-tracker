import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { CreateCustomListRequest } from '../../../core/models/custom-list.model';

@Component({
  selector: 'app-create-list-dialog',
  templateUrl: './create-list-dialog.component.html',
  styleUrls: ['./create-list-dialog.component.scss']
})
export class CreateListDialogComponent implements OnInit {
  listForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateListDialogComponent>
  ) {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      isPublic: [false],
      coverImage: ['']
    });
  }

  ngOnInit(): void {
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    
    // Add tag
    if (value) {
      this.tags.push(value);
    }
    
    // Clear the input value
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.listForm.valid) {
      const formValue = this.listForm.value;
      const request: CreateCustomListRequest = {
        ...formValue,
        tags: this.tags.length > 0 ? this.tags : undefined
      };
      
      this.dialogRef.close(request);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 