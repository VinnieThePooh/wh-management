import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CacheService } from './services/cache.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatList,
    MatListItem,
    MatTreeModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  constructor(private cacheService: CacheService) {}

  ngOnInit(): void {
    this.cacheService.updateCache();
  }
}
