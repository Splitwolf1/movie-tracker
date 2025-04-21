import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomListsComponent } from './custom-lists.component';
import { CustomListDetailComponent } from './custom-list-detail/custom-list-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CustomListsComponent
  },
  {
    path: ':id',
    component: CustomListDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomListsRoutingModule { } 