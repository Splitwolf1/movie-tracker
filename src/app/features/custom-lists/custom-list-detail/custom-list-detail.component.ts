import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap } from 'rxjs';

import { CustomList, CustomListItem } from '../../../core/models/custom-list.model';
import { CustomListService } from '../../../core/services/custom-list.service';
import { EditListDialogComponent } from '../edit-list-dialog/edit-list-dialog.component';

@Component({
  selector: 'app-custom-list-detail',
  templateUrl: './custom-list-detail.component.html',
  styleUrls: ['./custom-list-detail.component.scss']
})
export class CustomListDetailComponent implements OnInit {
  customList$: Observable<CustomList | null>;
  isLoading = true;
  listId: string;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customListService: CustomListService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.listId = '';
    this.customList$ = of(null);
  }

  ngOnInit(): void {
    this.customList$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        
        if (!id) {
          this.router.navigate(['/custom-lists']);
          return of(null);
        }
        
        this.listId = id;
        this.isLoading = true;
        
        return this.customListService.getCustomList(id).pipe(
          switchMap(list => {
            this.isLoading = false;
            
            if (!list) {
              this.snackBar.open('List not found', 'Close', { duration: 3000 });
              this.router.navigate(['/custom-lists']);
            }
            
            return of(list);
          })
        );
      })
    );
  }

  // Helper method to check if movie has genres
  hasGenres(item: CustomListItem): boolean {
    return !!item.movie && !!item.movie.genres && item.movie.genres.length > 0;
  }

  // Helper method to safely get first two genres
  getGenres(item: CustomListItem): any[] {
    if (this.hasGenres(item)) {
      return item.movie!.genres!.slice(0, 2);
    }
    return [];
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
            this.router.navigate(['/custom-lists']);
          } else {
            this.snackBar.open('Failed to delete list', 'Close', { duration: 3000 });
          }
        }
      );
    }
  }

  removeMovie(list: CustomList, item: CustomListItem): void {
    if (confirm(`Remove "${item.movie?.title}" from this list?`)) {
      this.customListService.removeFromCustomList(list.id, item.movieId).subscribe(
        updatedList => {
          if (updatedList) {
            this.snackBar.open('Movie removed from list', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to remove movie', 'Close', { duration: 3000 });
          }
        }
      );
    }
  }

  updateNotes(list: CustomList, item: CustomListItem, notes: string): void {
    this.customListService.updateMovieNotes(list.id, item.movieId, notes).subscribe(
      updatedList => {
        if (updatedList) {
          this.snackBar.open('Notes updated', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to update notes', 'Close', { duration: 3000 });
        }
      }
    );
  }
} 