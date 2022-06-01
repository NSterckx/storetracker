import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivateListPage } from './privateList.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { PrivateListPageRoutingModule } from './privateList-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    PrivateListPageRoutingModule
  ],
  declarations: [PrivateListPage]
})
export class PrivateListPageModule {}
