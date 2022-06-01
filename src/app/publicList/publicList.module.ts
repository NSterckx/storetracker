import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicListPage } from './publicList.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { PublicListPageRoutingModule } from './publicList-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    PublicListPageRoutingModule
  ],
  declarations: [PublicListPage]
})
export class PublicListPageModule {}
