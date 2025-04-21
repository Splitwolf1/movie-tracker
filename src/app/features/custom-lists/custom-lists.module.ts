import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CustomListsRoutingModule } from './custom-lists-routing.module';
import { CustomListsComponent } from './custom-lists.component';
import { CustomListDetailComponent } from './custom-list-detail/custom-list-detail.component';
import { CreateListDialogComponent } from './create-list-dialog/create-list-dialog.component';
import { EditListDialogComponent } from './edit-list-dialog/edit-list-dialog.component';
import { AddToListDialogComponent } from './add-to-list-dialog/add-to-list-dialog.component';

@NgModule({
  declarations: [
    CustomListsComponent,
    CustomListDetailComponent,
    CreateListDialogComponent,
    EditListDialogComponent,
    AddToListDialogComponent
  ],
  imports: [
    CommonModule,
    CustomListsRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule
  ],
  exports: [
    CustomListsComponent,
    CustomListDetailComponent
  ]
})
export class CustomListsModule { } 