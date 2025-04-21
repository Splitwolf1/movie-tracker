import { Component, Input } from '@angular/core';
import { Person } from '../../../../core/models/person.model';

@Component({
  selector: 'app-popular-people-section',
  template: `
    <section class="popular-people-section">
      <h2 class="section-title">Popular People</h2>
      
      <div class="people-grid" *ngIf="!loading; else loadingTemplate">
        <mat-card class="person-card" *ngFor="let person of people">
          <img [src]="getProfileUrl(person)" [alt]="person.name" class="profile-image">
          <mat-card-content>
            <h3 class="person-name">{{ person.name }}</h3>
            <div class="person-info">
              <span class="department">
                <mat-icon>work</mat-icon>
                {{ person.known_for_department }}
              </span>
              <span class="popularity">
                <mat-icon>trending_up</mat-icon>
                {{ person.popularity | number:'1.0-0' }}
              </span>
            </div>
            <div class="known-for" *ngIf="person.known_for?.length">
              <h4>Known For:</h4>
              <div class="known-for-grid">
                <div class="known-for-item" *ngFor="let work of person.known_for">
                  <img [src]="getPosterUrl(work)" [alt]="work.title" class="known-for-poster">
                  <span class="known-for-title">{{ work.title }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-container">
          <app-loading-spinner></app-loading-spinner>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .popular-people-section {
      margin: 2rem 0;
    }
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
    }
    .people-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .person-card {
      cursor: pointer;
      transition: transform 0.2s;
      &:hover {
        transform: translateY(-5px);
      }
    }
    .profile-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 4px 4px 0 0;
    }
    .person-name {
      font-size: 1.1rem;
      margin: 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .person-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    .department, .popularity {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .department {
      color: #2196f3;
    }
    .popularity {
      color: #4caf50;
    }
    .known-for {
      margin-top: 1rem;
      h4 {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #666;
      }
    }
    .known-for-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    .known-for-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .known-for-poster {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    .known-for-title {
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .loading-container {
      min-height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class PopularPeopleSectionComponent {
  @Input() people: Person[] = [];
  @Input() loading: boolean = false;

  getProfileUrl(person: Person): string {
    return person.profile_path
      ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
      : 'assets/images/no-profile.jpg';
  }

  getPosterUrl(work: { poster_path: string | null }): string {
    return work.poster_path
      ? `https://image.tmdb.org/t/p/w200${work.poster_path}`
      : 'assets/images/no-poster.jpg';
  }
} 