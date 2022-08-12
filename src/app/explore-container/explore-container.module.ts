import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponent } from './explore-container.component';
import { TimeMaskPipe } from '../time-mask.pipe';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [ExploreContainerComponent, TimeMaskPipe],
  exports: [ExploreContainerComponent],
})
export class ExploreContainerComponentModule {}
