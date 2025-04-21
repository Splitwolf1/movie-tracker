import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { CustomList, CustomListFilter, CustomListSortOption } from '../../core/models/custom-list.model';
import { CustomListService } from '../../core/services/custom-list.service';
import { CreateListDialogComponent } from './create-list-dialog/create-list-dialog.component';
import { EditListDialogComponent } from './edit-list-dialog/edit-list-dialog.component';

@Component({
  selector: 'app-custom-lists',
  templateUrl: './custom-lists.component.html',
  styleUrls: ['./custom-lists.component.scss']
})
export class CustomListsComponent implements OnInit {
  customLists$: Observable<CustomList[]>;
  isLoading = true;
  filter: CustomListFilter = {
    sortBy: CustomListSortOption.RECENT
  };
  
  sortOptions = [
    { value: CustomListSortOption.RECENT, label: 'Most Recent' },
    { value: CustomListSortOption.NAME, label: 'Name (A-Z)' },
    { value: CustomListSortOption.ITEM_COUNT, label: 'Number of Movies' },
    { value: CustomListSortOption.DATE_CREATED, label: 'Date Created' },
    { value: CustomListSortOption.DATE_UPDATED, label: 'Date Updated' }
  ];

  constructor(
    private customListService: CustomListService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.customLists$ = this.customListService.getFilteredCustomLists(this.filter);
  }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.customListService.loadCustomLists();
    this.customLists$ = this.customListService.getFilteredCustomLists(this.filter);
    this.isLoading = false;
  }

  applyFilter(filter: CustomListFilter): void {
    this.filter = { ...this.filter, ...filter };
    this.customLists$ = this.customListService.getFilteredCustomLists(this.filter);
  }

  applySort(sortBy: CustomListSortOption): void {
    this.filter.sortBy = sortBy;
    this.customLists$ = this.customListService.getFilteredCustomLists(this.filter);
  }

  applySearch(searchTerm: string): void {
    this.filter.searchTerm = searchTerm;
    this.customLists$ = this.customListService.getFilteredCustomLists(this.filter);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateListDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customListService.createCustomList(result).subscribe(
          list => {
            if (list) {
              this.snackBar.open('List created successfully', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Failed to create list', 'Close', { duration: 3000 });
            }
          }
        );
      }
    });
  }

  openEditDialog(list: CustomList): void {
    const dialogRef = this.dialog.open(EditListDialogComponent, {
      width: '500px',
      data: list
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customListService.updateCustomList(list.id, result).subscribe(
          updatedList => {
            if (updatedList) {
              this.snackBar.open('List updated successfully', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Failed to update list', 'Close', { duration: 3000 });
            }
          }
        );
      }
    });
  }

  deleteList(list: CustomList): void {
    if (confirm(`Are you sure you want to delete "${list.name}"? This cannot be undone.`)) {
      this.customListService.deleteCustomList(list.id).subscribe(
        success => {
          if (success) {
            this.snackBar.open('List deleted successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to delete list', 'Close', { duration: 3000 });
          }
        }
      );
    }
  }
} 