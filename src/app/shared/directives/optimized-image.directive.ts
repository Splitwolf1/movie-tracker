import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * OptimizedImageDirective handles automatic image optimization.
 * Features:
 * - Lazy loading of images
 * - Responsive image sizing with srcset
 * - Placeholder loading
 * - Error handling
 * 
 * Usage:
 * <img appOptimizedImage 
 *      [src]="imageUrl" 
 *      [sizes]="'(max-width: 768px) 100vw, 50vw'"
 *      [alt]="'Description'">
 */
@Directive({
  selector: '[appOptimizedImage]'
})
export class OptimizedImageDirective implements OnInit {
  @Input() src: string = '';
  @Input() sizes: string = '100vw';

  private placeholderSrc: string = 'assets/images/placeholder.svg';
  private errorSrc: string = 'assets/images/image-error.svg';
  
  private baseImagePath: string = 'https://image.tmdb.org/t/p/';
  private imageSizes: string[] = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Add loading="lazy" for automatic browser lazy loading
    this.renderer.setAttribute(this.el.nativeElement, 'loading', 'lazy');
    
    // Set placeholder while loading
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholderSrc);
    
    // Process the source if it's a TMDb image
    if (this.src && this.src.includes('/t/p/')) {
      // Extract the path part after the size
      const parts = this.src.split('/t/p/');
      if (parts.length === 2) {
        const sizeParts = parts[1].split('/');
        if (sizeParts.length > 1) {
          const imagePath = '/' + sizeParts.slice(1).join('/');
          this.generateSrcSet(imagePath);
        }
      } else {
        // Not a TMDb URL, use as is
        this.renderer.setAttribute(this.el.nativeElement, 'src', this.src);
      }
    } else if (this.src) {
      // Not a TMDb URL, use as is
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.src);
    }
    
    // Set sizes attribute
    this.renderer.setAttribute(this.el.nativeElement, 'sizes', this.sizes);
    
    // Add error handler
    this.renderer.listen(this.el.nativeElement, 'error', () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.errorSrc);
    });
  }

  /**
   * Generate srcset attribute with multiple resolution options
   */
  private generateSrcSet(imagePath: string): void {
    if (!imagePath) return;
    
    // Generate srcset with various sizes
    const srcSetParts = this.imageSizes.map(size => {
      const width = size === 'original' ? 1000 : parseInt(size.substring(1));
      return `${this.baseImagePath}${size}${imagePath} ${width}w`;
    });
    
    const srcset = srcSetParts.join(', ');
    this.renderer.setAttribute(this.el.nativeElement, 'srcset', srcset);
    
    // Set the default src to a medium size
    this.renderer.setAttribute(
      this.el.nativeElement, 
      'src', 
      `${this.baseImagePath}w342${imagePath}`
    );
  }
} 