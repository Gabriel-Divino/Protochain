import { Component, OnInit } from '@angular/core';
import Blockchain from '../lib/blockchain';
import { ActivatedRoute } from '@angular/router';
import { transactionType } from '../lib/utils';

@Component({
  selector: 'app-transaction',
  standalone: false,
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit{

  transactionId: string | null = null;
  transaction : any = null;
  blockchain : Blockchain = new Blockchain();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() : void{
    // Pegando o parâmetro da URL
    this.transactionId = this.route.snapshot.paramMap.get('tx');

    // Caso precise observar mudanças de parâmetro
    this.route.paramMap.subscribe((params) => {
      this.transactionId = params.get('tx');

      this.transaction = this.blockchain.getBlocks()
        ?.map((b)=>b.transactions)
        .flat()
        .find((tx) => tx.signature == this.transactionId)
    });  
  }

  transactionType(n:number) : string{
    return transactionType(n);
  }


}
