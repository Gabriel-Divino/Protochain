import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { HeaderComponent } from './header/header.component';
import { WalletsComponent } from './wallets/wallets.component';
import { TransactionComponent } from './transaction/transaction.component';
import { BalancesComponent } from './balances/balances.component';
import { BlocksComponent } from './blocks/blocks.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'wallets', component: WalletsComponent },  
    { path: 'transactions/:tx', component: TransactionComponent },
    { path: 'balances/:wallet', component: BalancesComponent },
    { path: 'blocks/:block', component: BlocksComponent },

];




@NgModule({
    declarations:[
        MainComponent,
        HeaderComponent,
        WalletsComponent,
        TransactionComponent,
        BalancesComponent,
        BlocksComponent
    ],
    imports: [RouterModule.forRoot(routes),FormsModule,CommonModule],
    exports: [RouterModule],
    providers:[]

})
export class AppRoutingModule { }
