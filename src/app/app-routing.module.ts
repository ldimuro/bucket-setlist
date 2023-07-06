import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { HomeComponent } from './home/home.component';
import { ArtistComponent } from './artist/artist.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent, data: { title: 'Bucket Setlist' } },
  { path: 'search', component: SearchComponent, data: { title: 'Seach for a Song' }},
  { path: 'artist', component: ArtistComponent, data: { title: 'Artist' }},
  { path: '**', redirectTo: '/search'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
