import { Component, OnInit } from '@angular/core';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {


  blockchain:Blockchain = new Blockchain();

  ngOnInit(): void {

    console.log(this.blockchain.getBlocks());
  }

  createBlock(){
    this.blockchain.addBlock("Gabriel",1000);
    console.log(this.blockchain.getBlocks());
    
  }

  clear() : void{
    this.blockchain.clear()
  }

}
