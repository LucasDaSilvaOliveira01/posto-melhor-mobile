import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MockPage } from './mock.page';

const routes: Routes = [
  {
    path: '',
    component: MockPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MockRoutingModule {}
