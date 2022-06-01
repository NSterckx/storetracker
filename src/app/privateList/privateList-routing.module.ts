import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateListPage } from './privateList.page';
import {StorePage} from './store/store.page';

const routes: Routes = [
  {
    path: '',
    component: PrivateListPage,
  },
  {
    path: 'store',
    component: StorePage
  },
  {
    path: 'store/:id',
    component: StorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivateListPageRoutingModule {}
