import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingSpinnerComponent],
      imports: [MatProgressSpinnerModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a spinner', () => {
    const spinnerElement = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinnerElement).toBeTruthy();
  });

  it('should have the correct diameter', () => {
    const spinnerElement = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinnerElement.getAttribute('ng-reflect-diameter')).toBe('50');
  });

  it('should have the spinner container', () => {
    const containerElement = fixture.nativeElement.querySelector('.spinner-container');
    expect(containerElement).toBeTruthy();
  });
}); 