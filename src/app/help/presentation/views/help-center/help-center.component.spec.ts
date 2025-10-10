import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpCenterComponent } from './help-center.component';
/**
 * Componente de vista para el Centro de Ayuda.
 * Muestra la información y recursos de ayuda disponibles.
 */

describe('HelpCenterComponent', () => {
  let component: HelpCenterComponent;
  let fixture: ComponentFixture<HelpCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpCenterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el título "Centro de Ayuda"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Centro de Ayuda');
  });
  /**
   * Lista de recursos de ayuda a mostrar.
   */

  it('debe mostrar las preguntas frecuentes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('¿Cómo me registro como cliente?');
    expect(compiled.textContent).toContain('¿Cómo canjeo un cupón en el local?');
    expect(compiled.textContent).toContain('¿Por qué pedimos tu ubicación y cómo activarla?');
  });
});
