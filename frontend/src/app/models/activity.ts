import { expand } from "rxjs";

// Import or define the MapData interface
interface MapData {
  id: string;
  summary_polyline: string;
}

export default class Activity {
  title: string;
  date: string;
  duration: number;
  distance: number;
  avgHeartRate: number;
  maxHeartRate: number;
  mapData: MapData; // Use the MapData interface

  constructor(
    title: string,
    date: string,
    duration: number,
    distance: number,
    avgHeartRate: number,
    maxHeartRate: number,
    mapData: MapData // Ensure the constructor parameter matches the type
  ) {
    this.title = title;
    this.date = date;
    this.duration = duration;
    this.distance = distance;
    this.avgHeartRate = avgHeartRate;
    this.maxHeartRate = maxHeartRate;
    this.mapData = mapData;
  }
}