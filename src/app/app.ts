
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HeaderComponent } from './shared/header/header.component';
import { ToastComponent } from './shared/toast/toast.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  showLayout = false;

  ngOnInit() {
    this.showLayout = !!localStorage.getItem('token');
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.showLayout = !!localStorage.getItem('token');
    });
  }
}