import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

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
    const placeExist = this.userPlaces().some(currPlace => currPlace.id === place.id);
    const prevPlaces = this.userPlaces();
    if (!placeExist) {
      this.userPlaces.set([...prevPlaces, place])

    }

    return this.httpClient.put('http://localhost:3000/user-places', {
      placeId: place.id
    }).pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces);
        return throwError(() => new Error('Error adding user places'));
      })
    )
  }

  removeUserPlace(place: Place) {
    this.userPlaces.set(this.userPlaces().filter(currPlace => currPlace.id !== place.id))
    const prevPlaces = this.userPlaces();

    return this.httpClient.delete(`http://localhost:3000/user-places/${place.id}`)
    .pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces);
        return throwError(() => new Error('Error deleting user places'));
      })
    )
  }

  private fetchPlaces(url: string) {
    return this.httpClient.get<{places: Place[]}>(url)
    .pipe(
      map(res => res.places)
    )
  }
}
