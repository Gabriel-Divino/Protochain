import { Block } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Blockchain from '../lib/blockchain';
import { transactionType } from '../lib/utils';

@Component({
  selector: 'app-blocks',
  standalone: false,
  templateUrl: './blocks.component.html',
  styleUrl: './blocks.component.css',
})
export class BlocksComponent implements OnInit {

  blockId: string | null = null;
  block : any = null;
  blockchain : Blockchain = new Blockchain();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Pegando o parâmetro da URL
    this.blockId = this.route.snapshot.paramMap.get('block');

    // Caso precise observar mudanças de parâmetro
    this.route.paramMap.subscribe((params) => {
      this.blockId = params.get('block');
      console.log('Block ID atualizado:', this.blockId)

      this.block = this.blockchain.getBlocks()?.find((b)=>b.hash == this.blockId);
    });
  }

    transactionType(n:number) : string{
      return transactionType(n);
    }
}
