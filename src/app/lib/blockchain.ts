import { Injectable } from "@angular/core";
import Block from "./block";
import Wallet from "./wallet";
import Transaction from "./transaction";
import { TransactionType } from "./transactionType";


export default class Blockchain{

    private blocks : Block[] =  [] as Block[];
    nextIndex : number =  0;
    private owner : Wallet;
    private genesis : Wallet;
    private privateKeyGenesisWallet : string = "15bb850d56d744da6ad15725034118c9881785d7004c6f0f4f860aaba1e5f9a4";
    private privateKeyOwnerWallet : string = "15441fec09cd9010eb753075a652174ccd9906409508a986c53d00f357b76ff9";
    private mempool : Transaction[] = [] as Transaction[];


    constructor() {
        this.owner = new Wallet("Owner",this.privateKeyOwnerWallet);
        this.genesis = new Wallet("Genesis",this.privateKeyGenesisWallet);
        console.log(this.owner)
        this.getBlockchain();
    }

    addBlock(block : Block) : void{
        
        block.index = this.nextIndex;
        this.blocks.push(block);
        this.nextIndex+=1;
        this.saveBlockchain();
    }

    /**
     * Valida se já há uma blockchain existente , caso não exista é criado uma.
     */
    getBlockchain() : void {
        let blocks : Block[] | null = JSON.parse(localStorage.getItem('blockchain') as string);
        if(!blocks){

            const block : Block = new Block({
                miner:this.owner.publicKey,

            } as Block)

            const tx : Transaction = new Transaction({
                to:this.owner.publicKey,
                from:this.genesis.publicKey,
                value:1000,
                type:TransactionType.REGULAR

            } as Transaction)


            const message : string = JSON.stringify(tx);
            tx.signature = this.genesis.signMessage(message);

            block.transactions.push(tx);
            block.hash = block.getHash();

            this.blocks.push(block);
            this.saveBlockchain();
            this.nextIndex+=1;

        }else{
            this.blocks = blocks;
            this.nextIndex = this.blocks.length;
        }
    }

    /**
     * 
     * @returns Retorna todos blocos da blockchain
     */
    getBlocks() : Block[] | undefined{
        return this.blocks;
    }

    /**
     * Salva a blockchain no localstorage
     */
    saveBlockchain() : void {
        localStorage.setItem('blockchain',JSON.stringify(this.blocks));
    }

    /**
     * Limpa a blockchain
     */
    clear() : void{
        localStorage.removeItem('blockchain')
    }

    /**
     * 
     * @returns Retorna a carteira do primeiro usuário detentor de saldo
     */
    getOwner() : Wallet{
        return this.owner;
    }

    /**
     * 
     * @param wallet carteira a ser consultada
     * @returns retorna o saldo da carteira
     */
    getBalance(wallet : string) : number {
        const inputBalance : number =  this.blocks.map((b)=>b.transactions)
        .flat()
        .filter((tx)=>tx.to == wallet)
        .map((tx)=>tx.value)
        .reduce((a,b)=>a+b,0);

        const outgoingBalance : number =  this.blocks.map((b)=>b.transactions)
        .flat()
        .filter((tx)=>tx.from == wallet)
        .map((tx)=>tx.value)
        .reduce((a,b)=>a+b,0);

        const balance : number = inputBalance -  outgoingBalance;

        return balance;
        
    }

    getMemPool() : Transaction[]{
        return this.mempool;
    }


    addTransactions(transaction : Transaction) : void {
        if(transaction.isValid(transaction.getMessage()).status == true){
            this.mempool.push(transaction);
        }
    }


}