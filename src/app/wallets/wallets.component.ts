import { Component, OnInit } from '@angular/core';
import Blockchain, { AddBlockResponse } from '../lib/blockchain';
import Wallet from '../lib/wallet';
import Transaction from '../lib/transaction';
import Validation from '../lib/validation';
import { TransactionType } from '../lib/transactionType';
import TransactionEntry from '../lib/transactionEntry';
import { ChangeDetectorRef } from '@angular/core';


interface Miner {

  wallet : Wallet,
  mining : boolean

}

@Component({
  selector: 'app-wallets',
  standalone: false,
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.css'
})


export class WalletsComponent implements OnInit{


  constructor(private cdr: ChangeDetectorRef) {}
  

  wallets : Wallet[] = [] as Wallet[];
  miners : Miner[] = [] as Miner[];
  blockchain:Blockchain = new Blockchain();

  ngOnInit(): void {    
    this.wallets[0] = this.blockchain.getOwner();
  }


  addWallet(): void {
    const name : string  = window.prompt('Qual Nome do Usuário  da carteira ?') as string;
    const newWallet : Wallet = new Wallet(name)
    this.wallets.push(newWallet)
    console.log(this.wallets);
    
  }

  recoverWallet() : void {
    const privateKey : string = window.prompt('Chave privada para recuperação de carteira') as string;
    const name : string  = window.prompt('Qual Nome do Usuário  da carteira ?') as string;
    const newWallet : Wallet = new Wallet(name,privateKey);
    this.wallets.push(newWallet)
    console.log(this.wallets);
     
  }

  isMining(wallet : Wallet) : boolean{

    const w : Miner | undefined = this.miners.find((w)=>w.wallet.publicKey == wallet.publicKey);
    if(!w) return false;
    return w?.mining;
  }

  mining(wallet : Wallet){
    const w : Miner | undefined = this.miners.find((w)=>w.wallet.publicKey == wallet.publicKey);
    let nonce : number = 0;
    if(w?.mining == true){
      //console.log(`${wallet.name} começou a minerar`)
      let success : boolean = false;
      for(let i = 0;i<=10000;i++){
        const mine : AddBlockResponse = this.blockchain.addBlock(wallet.publicKey,nonce)
        nonce+=1;
        if(mine.isValid.status){
          console.log(`${wallet.name} minerou o bloco : ${mine.block.index} `);
          success=true;
          
        }
      }
      //this.cdr.detectChanges();
      if(success == false){
        //console.log(`${wallet.name} não conseguiu minerar :(`);
        setTimeout(()=>{
          this.pauseMining(wallet);
        },2000)
      }
    }else{
      //console.log(`${wallet.name} parou de minerar`);
    }
  }

  mine(wallet : Wallet) : void {
    const indexWallet : number = this.miners.findIndex((w)=>w.wallet.publicKey == wallet.publicKey);
    console.log(indexWallet);
    if(indexWallet != -1){
      this.miners[indexWallet].mining = true;
    }else{
      const miner : Miner = {
        wallet:wallet,
        mining:true
      }
  
      this.miners.push(miner);
    }

  }

  pauseMining(wallet : Wallet) : void{
    const indexWallet : number = this.miners.findIndex((w)=>w.wallet.publicKey == wallet.publicKey);
    console.log(indexWallet);
    if(indexWallet != -1){
      this.miners[indexWallet].mining = false;
    }
  }



  makePayments(from : Wallet) : void {

      const to : string = window.prompt("Para qual carteira você deseja fazer o pagamento ?") as string;
      const value : string = window.prompt("Valor a ser transferido :") as string;

      const faker : Wallet =  new Wallet("Faker","df94c2582a5d05d5b5f707c0e174619ad1da1a1cf8e55bc8385e75e15ff40d01");

      //Cria a Transação Regular
      const tx : Transaction = new Transaction({
        from:from.publicKey,
        to:to,
        value:parseInt(value) - 1,
        type:TransactionType.REGULAR

      } as Transaction);

      const message : string = tx.getMessage();
      tx.signature = from.signMessage(message); //Assinatura Genuina
      //tx.signature = faker.signMessage(message); //Assinatura de um Usuário Mal intensionado

      //Criar a Transação de Taxa
      const txFee : Transaction = new Transaction({
          value:1,
          to:this.blockchain.getOwner().publicKey,
          from:from.publicKey,
          type:TransactionType.FEE
      }as Transaction);

      txFee.signature = from.signMessage(txFee.getMessage());

      const txEntry : TransactionEntry = new TransactionEntry(tx,txFee);
      const valid : Validation = txEntry.isValid();
      window.alert(`Validação de Transação : ${valid.message}`);
      this.blockchain.addTransactions(txEntry);
      console.log(this.blockchain.getNextBlock());

  }

  walletBalance(wallet : Wallet) : number {
    return this.blockchain.getBalance(wallet.publicKey);
  }

}
