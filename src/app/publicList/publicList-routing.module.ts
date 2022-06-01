import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicListPage } from './publicList.page';

const routes: Routes = [
  {
    path: '',
    component: PublicListPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicListPageRoutingModule {}
