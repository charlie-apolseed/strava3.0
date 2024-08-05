import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import Activity from '../../models/activity';
import { ActivitiesService } from '../../activities.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Note: Do not import 'leaflet' at the top level
import { decode } from '@googlemaps/polyline-codec';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {
  activities: Activity[] = [];
  showFilter = false;
  private map!: L.Map;
  private polylines: L.Polyline[] = [];

  constructor(private activitiesService: ActivitiesService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.activitiesService.getMostRecentActivities(10)
      .subscribe(activities => this.activities = activities);

    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => {
        this.initMap();
      });
    }
  }

  private loadLeaflet(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        import('leaflet').then(L => {
          // Attach Leaflet to window if necessary
          window['L'] = L;
          resolve(L);
        }).catch(error => reject(error));
      } else {
        resolve(null);
      }
    });
  }

  private initMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const L = window['L'];
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  expandedActivityIndex: number | null = null;

  toggleActivity(index: number): void {
    if (this.expandedActivityIndex === index) {
      this.expandedActivityIndex = null;
      this.clearPolylines();
    } else {
      this.expandedActivityIndex = index;
      this.clearPolylines();
      this.addPolyline(index);
    }
  }

  private clearPolylines(): void {
    this.polylines.forEach(polyline => this.map.removeLayer(polyline));
    this.polylines = [];
  }

  private addPolyline(index: number): void {
    if (!isPlatformBrowser(this.platformId) || !this.map) return;

    const activity = this.activities[index];
    const encodedPolyline = activity.mapData.summary_polyline;

    if (!encodedPolyline) return;

    // Decode the polyline
    const coordinates = decode(encodedPolyline).map(coord => [coord[0], coord[1]] as [number, number]);

    // Create and add the polyline to the map
    const polyline = window['L'].polyline(coordinates, {
      color: 'red',
      weight: 5,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(this.map);

    this.polylines.push(polyline);

    // Adjust the map view to the polyline bounds
    this.map.fitBounds(polyline.getBounds());
  }

  displayFilterInfo(): void {
    this.showFilter = !this.showFilter;
  }

  maxDistance = 150000;

  getColorForDistance(distance: number): string {
    const normalized = Math.min(Math.sqrt(distance) / Math.sqrt(this.maxDistance), 1);
    const r = 255;
    const g = Math.floor(255 * (1 - normalized));
    const b = 255;

    return `rgb(${r}, ${g}, ${b})`;
  }
}
