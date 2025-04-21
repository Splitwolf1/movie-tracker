import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { TrendingSectionComponent } from './components/trending-section/trending-section.component';
import { PopularSectionComponent } from './components/popular-section/popular-section.component';
import { UpcomingSectionComponent } from './components/upcoming-section/upcoming-section.component';
import { PopularPeopleSectionComponent } from './components/popular-people-section/popular-people-section.component';

@NgModule({
  declarations: [
    HomeComponent,
    HeroSectionComponent,
    TrendingSectionComponent,
    PopularSectionComponent,
    UpcomingSectionComponent,
    PopularPeopleSectionComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { } 