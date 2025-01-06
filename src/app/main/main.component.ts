import { Component, OnInit } from '@angular/core';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';
import Transaction from '../lib/transaction';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {


  blockchain:Blockchain = new Blockchain();
  transactions : Transaction[] | undefined = [];
  blocks : Block[] | undefined =  [];

  ngOnInit(): void {

    this.blocks = this.blockchain.getBlocks();
    this.transactions = this.blocks?.map((b)=>b.transactions).flat();

  }


  clear() : void{
    this.blockchain.clear()
    window.alert('Blockchain Zerada !');
  }

}
