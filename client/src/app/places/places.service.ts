import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient)
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places')
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places')
    .pipe(
      tap({
        next: userPlaces => this.userPlaces.set(userPlaces)
      })
    )
  }

  addPlaceToUserPlaces(place: Place) {
    this.userPlaces.set([...this.userPlaces(), place]);
    
    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    })
  }

  removeUserPlace(place: Place) {}

  private fetchPlaces(url: string) {
    return this.httpClient.get<{places: Place[]}>(url)
    .pipe(
      map(res => res.places)
    )
  }
}
