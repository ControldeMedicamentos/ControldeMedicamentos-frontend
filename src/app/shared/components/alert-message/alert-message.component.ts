import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  standalone: true,
  templateUrl: './alert-message.component.html',
  styleUrl: './alert-message.component.scss'
})
export class AlertMessageComponent {
  @Input() message = '';
  @Input() type: 'error' | 'info' = 'info';
}
