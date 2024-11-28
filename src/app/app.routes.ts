import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './screens/user-login/user-login.component';
import { NgModule } from '@angular/core';
import { ProjectPlanningComponent } from './screens/project-planning/project-planning.component';
import { PositionDetailComponent } from './screens/position-detail/position-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: '/userlogin', pathMatch: 'full' },
    { path: 'userlogin', component: UserLoginComponent },
    { path: 'projectPlanning', component: ProjectPlanningComponent },
    { path: 'positionDetail/:id', component: PositionDetailComponent },
    { path: '**', redirectTo: '/userlogin', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }