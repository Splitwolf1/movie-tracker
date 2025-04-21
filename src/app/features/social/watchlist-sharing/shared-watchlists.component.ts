import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { SocialService } from '../../../core/services/social.service';
import { SharedContent, ContentType } from '../../../core/models/social.model';
import { Movie } from '../../../core/models/movie.model';
import { switchMap, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shared-watchlists',
  templateUrl: './shared-watchlists.component.html',
  styleUrls: ['./shared-watchlists.component.scss']
})
export class SharedWatchlistsComponent implements OnInit {
  sharedWatchlists$: Observable<SharedContent[]>;
  selectedWatchlistId: string | null = null;
  selectedWatchlist$: Observable<Movie[]> | null = null;
  contentType = ContentType; // Expose ContentType enum to template
  
  constructor(
    private watchlistService: WatchlistService,
    private socialService: SocialService,
    private route: ActivatedRoute
  ) {
    this.sharedWatchlists$ = this.watchlistService.getSharedWatchlists();
  }
  
  ngOnInit(): void {
    // Check for query parameters to auto-select a watchlist
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.autoSelectWatchlist(params['id']);
      }
    });
  }
  
  autoSelectWatchlist(id: string): void {
    this.sharedWatchlists$.subscribe(watchlists => {
      const sharedContent = watchlists.find(w => w.contentId === id);
      if (sharedContent) {
        this.loadWatchlist(sharedContent);
      }
    });
  }
  
  loadWatchlist(sharedContent: SharedContent): void {
    this.selectedWatchlistId = sharedContent.contentId;
    this.selectedWatchlist$ = this.watchlistService.loadSharedWatchlist(sharedContent.contentId);
  }
  
  addMovieToWatchlist(movie: Movie): void {
    this.watchlistService.addToWatchlist(movie);
  }
  
  addComment(sharedContent: SharedContent, comment: string): void {
    if (!comment.trim()) {
      return;
    }
    
    this.socialService.addComment(
      ContentType.LIST,
      sharedContent.contentId,
      comment
    ).subscribe();
  }
} 