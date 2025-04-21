import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';

/**
 * DeferredLoadingDirective provides a way to defer the loading of components 
 * until they're needed, implementing code splitting at the component level.
 * 
 * Usage:
 * <ng-template [appDeferredLoading]="isVisible">
 *   <heavy-component></heavy-component>
 * </ng-template>
 */
@Directive({
  selector: '[appDeferredLoading]'
})
export class DeferredLoadingDirective implements OnInit {
  @Input('appDeferredLoading') set shouldLoad(value: boolean) {
    if (value && !this.loaded) {
      // Create embedded view from the template
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.loaded = true;
    } else if (!value && this.loaded) {
      // Clear the container if we want to hide
      this.viewContainerRef.clear();
      this.loaded = false;
    }
  }

  private loaded = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Default behavior - don't render anything initially
  }
} 