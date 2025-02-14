import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCustomHighlight]',  
  standalone: false
})
export class CustomHighlightDirective {
  // Входной параметр для цвета подсветки
  @Input('appCustomHighlight') highlightColor: string = 'lightblue';

  // Дополнительный параметр для эффекта масштабирования
  @Input() scale: number = 1.1;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // При наведении на элемент
  @HostListener('mouseenter') onMouseEnter() {
    this.setStyles(this.highlightColor, this.scale);
  }

  // При уходе курсора с элемента
  @HostListener('mouseleave') onMouseLeave() {
    this.setStyles('', 1);
  }

  private setStyles(backgroundColor: string, scale: number): void {
    // Устанавливаем цвет фона
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', backgroundColor);
    // Устанавливаем эффект масштабирования
    this.renderer.setStyle(this.el.nativeElement, 'transform', `scale(${scale})`);
    // Добавляем плавное изменение стилей
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }
}
