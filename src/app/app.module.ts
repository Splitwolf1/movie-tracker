import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Core
import { httpInterceptorFn } from './core/interceptors/http.interceptor';
import { csrfInterceptorFn } from './core/interceptors/csrf.interceptor';
import { rateLimitInterceptorFn } from './core/interceptors/rate-limit.interceptor';
import { CoreModule } from './core/core.module';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Shared Module
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([
        rateLimitInterceptorFn,
        csrfInterceptorFn, 
        httpInterceptorFn
      ])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 