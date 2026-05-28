import { Injectable } from '@angular/core';
import { Paciente } from '../../../models/paciente.model';

export interface AtencionDraft {
  formValues: Record<string, unknown>;
  paciente: Paciente | null;
  currentStep: number;
  hasFiles: boolean;
  savedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AtencionDraftService {
  private readonly KEY = 'sismed_atencion_draft';

  save(draft: Omit<AtencionDraft, 'savedAt'>): void {
    const data: AtencionDraft = { ...draft, savedAt: new Date().toISOString() };
    localStorage.setItem(this.KEY, JSON.stringify(data));
  }

  load(): AtencionDraft | null {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AtencionDraft; } catch { return null; }
  }

  clear(): void { localStorage.removeItem(this.KEY); }

  exists(): boolean { return !!localStorage.getItem(this.KEY); }

  tiempoGuardado(savedAt: string): string {
    const diffMs = Date.now() - new Date(savedAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'hace un momento';
    if (mins === 1) return 'hace 1 minuto';
    if (mins < 60) return `hace ${mins} minutos`;
    const hrs = Math.floor(mins / 60);
    return hrs === 1 ? 'hace 1 hora' : `hace ${hrs} horas`;
  }
}
