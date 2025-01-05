import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component';
import { WalletsComponent } from './wallets/wallets.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'wallets', component: WalletsComponent },    

];




@NgModule({
    declarations:[
        MainComponent,
        HeaderComponent,
        WalletsComponent
    ],
    imports: [RouterModule.forRoot(routes),FormsModule,CommonModule],
    exports: [RouterModule],
    providers:[]

})
export class AppRoutingModule { }
