import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ReporteService } from '../../services/reporte.service';
import { ReporteSismedComponent } from './reporte-sismed.component';

describe('ReporteSismedComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteSismedComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ReporteService,
          useValue: {
            getEstadoPeriodo: () => of({ cerrado: false }),
            getReporte: () => of([]),
            getConciliacion: () => of(null)
          }
        }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReporteSismedComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders official SISMED classifications in a horizontally scrollable table', () => {
    const fixture = TestBed.createComponent(ReporteSismedComponent);
    fixture.detectChanges();
    fixture.componentInstance.reporteData = [{
      periodo: '202608',
      codigoSismed: '06377',
      descripcionSismed: 'VACUNA ANTIAMARILICA',
      precioUnitario: 0.01,
      saldoInicial: 10,
      ingresos: 5,
      reingresos: 0,
      venta: 0,
      sis: 3,
      intersanidad: 0,
      factoresPerdida: 0,
      defuncionNacimiento: 0,
      exonerado: 0,
      soat: 0,
      creditoHospitalario: 0,
      otroConvenio: 0,
      consumos: 3,
      devoluciones: 0,
      vencidos: 0,
      merma: 0,
      distribucion: 0,
      transferencia: 0,
      stockFinal: 12
    }];

    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('clasificación SISMED');
    expect(element.textContent).toContain('06377');
    expect(element.querySelector('.overflow-x-auto')).not.toBeNull();
  });
});
