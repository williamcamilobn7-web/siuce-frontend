import { Injectable, signal } from '@angular/core';

export interface ToastMsg { id: number; text: string; type: 'ok'|'err'|'info'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  msgs = signal<ToastMsg[]>([]);
  private next = 0;
  show(text: string, type: 'ok'|'err'|'info' = 'ok') {
    const id = this.next++;
    this.msgs.update(m => [...m, { id, text, type }]);
    setTimeout(() => this.msgs.update(m => m.filter(x => x.id !== id)), 3200);
  }
}