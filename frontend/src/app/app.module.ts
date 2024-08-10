import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ActivitiesListComponent } from './pages/activities-list/activities-list.component';
import { DurationPipe } from './pipes/duration.pipe';


// Import other components and services here

@NgModule({
  declarations: [
    AppComponent,
    ActivitiesListComponent,
    DurationPipe
    // Add other components here
  ],
  imports: [
    CommonModule,
    BrowserModule,
  ],
  providers: [
    // Add services here if any
  ],
  bootstrap: [AppComponent] // The root component that Angular creates and inserts into the index.html host web page
})
export class AppModule { }