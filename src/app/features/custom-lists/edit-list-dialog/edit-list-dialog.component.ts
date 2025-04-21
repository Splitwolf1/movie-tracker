import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

import { CustomList, UpdateCustomListRequest } from '../../../core/models/custom-list.model';

@Component({
  selector: 'app-edit-list-dialog',
  templateUrl: './edit-list-dialog.component.html',
  styleUrls: ['./edit-list-dialog.component.scss']
})
export class EditListDialogComponent implements OnInit {
  listForm: FormGroup;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CustomList
  ) {
    this.listForm = this.fb.group({
      name: [data.name, [Validators.required, Validators.maxLength(100)]],
      description: [data.description, [Validators.maxLength(500)]],
      isPublic: [data.isPublic],
      coverImage: [data.coverImage || '']
    });

    this.tags = data.tags ? [...data.tags] : [];
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
      const request: UpdateCustomListRequest = {
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