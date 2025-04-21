import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CustomList } from '../../../core/models/custom-list.model';
import { CustomListService } from '../../../core/services/custom-list.service';
import { Movie } from '../../../core/models/movie.model';

interface DialogData {
  movie: Movie;
}

@Component({
  selector: 'app-add-to-list-dialog',
  templateUrl: './add-to-list-dialog.component.html',
  styleUrls: ['./add-to-list-dialog.component.scss']
})
export class AddToListDialogComponent implements OnInit {
  customLists: CustomList[] = [];
  filteredLists: Observable<CustomList[]>;
  selectedLists: CustomList[] = [];
  searchControl = new FormControl('');
  notes = new FormControl('');
  isLoading = true;
  processingLists: string[] = [];
  
  constructor(
    private dialogRef: MatDialogRef<AddToListDialogComponent>,
    private customListService: CustomListService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.filteredLists = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.customListService.getCustomLists().subscribe(lists => {
      this.customLists = lists;
      this.checkExistingLists();
      this.isLoading = false;
    });
  }

  private checkExistingLists(): void {
    this.customListService.getListsContainingMovie(this.data.movie.id).subscribe(lists => {
      this.selectedLists = lists;
    });
  }

  private _filter(value: string): CustomList[] {
    const filterValue = value.toLowerCase();
    return this.customLists.filter(list => list.name.toLowerCase().includes(filterValue));
  }

  isSelected(list: CustomList): boolean {
    return this.selectedLists.some(l => l.id === list.id);
  }

  toggleList(list: CustomList): void {
    const index = this.selectedLists.findIndex(l => l.id === list.id);
    
    if (index === -1) {
      this.selectedLists.push(list);
    } else {
      this.selectedLists.splice(index, 1);
    }
  }

  addToLists(): void {
    const movie = this.data.movie;
    const noteValue = this.notes.value || undefined;

    // Convert to Promise.all to process all lists in parallel
    const promises = this.selectedLists.map(list => {
      this.processingLists.push(list.id);
      
      return new Promise<void>(resolve => {
        this.customListService.addToCustomList(list.id, movie, noteValue).subscribe({
          next: () => {
            const index = this.processingLists.indexOf(list.id);
            if (index > -1) {
              this.processingLists.splice(index, 1);
            }
            resolve();
          },
          error: () => {
            const index = this.processingLists.indexOf(list.id);
            if (index > -1) {
              this.processingLists.splice(index, 1);
            }
            resolve();
          }
        });
      });
    });

    Promise.all(promises).then(() => {
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isProcessing(listId: string): boolean {
    return this.processingLists.includes(listId);
  }

  createNewList(): void {
    this.dialogRef.close('create');
  }
} 