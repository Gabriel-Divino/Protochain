import { Component, OnInit } from '@angular/core';
import Blockchain from '../lib/blockchain';
import { ActivatedRoute } from '@angular/router';
import Transaction from '../lib/transaction';
import { transactionType } from '../lib/utils';

@Component({
  selector: 'app-balances',
  standalone: false,
  templateUrl: './balances.component.html',
  styleUrl: './balances.component.css'
})
export class BalancesComponent implements OnInit {


  walletId: string | null = null;
  balance : any = null;
  blockchain : Blockchain = new Blockchain();
  transactions : Transaction[] | undefined =  [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() : void{
    // Pegando o parâmetro da URL
    this.walletId = this.route.snapshot.paramMap.get('wallet');

    // Caso precise observar mudanças de parâmetro
    this.route.paramMap.subscribe((params) => {
      this.walletId = params.get('wallet');
      this.balance = this.blockchain.getBalance(this.walletId as string);

      this.transactions = this.blockchain.getBlocks()
        ?.map((b)=>b.transactions)
        .flat()
        .filter((tx)=>tx.from == this.walletId || tx.to == this.walletId);
    
    });  
  }

    transactionType(n:number) : string{
      return transactionType(n);
    }


}
