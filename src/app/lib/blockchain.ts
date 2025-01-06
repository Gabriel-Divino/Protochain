import { Injectable } from "@angular/core";
import Block from "./block";
import Wallet from "./wallet";
import Transaction from "./transaction";
import { TransactionType } from "./transactionType";
import Validation from "./validation";
import TransactionEntry from "./transactionEntry";


interface BlockInfo{

    index:number;
    previousHash:string;
    transactions: Transaction[];
    difficulty : number;


}


export interface AddBlockResponse {
    isValid : Validation,
    block : Block
}

export default class Blockchain{

    private blocks : Block[] =  [] as Block[];
    nextIndex : number =  0;
    private owner : Wallet;
    private genesis : Wallet;
    private privateKeyGenesisWallet : string = "15bb850d56d744da6ad15725034118c9881785d7004c6f0f4f860aaba1e5f9a4";
    private privateKeyOwnerWallet : string = "15441fec09cd9010eb753075a652174ccd9906409508a986c53d00f357b76ff9";
    private mempool : TransactionEntry[] = [] as TransactionEntry[];
    static difficulty : number = 1;

    constructor() {
        this.owner = new Wallet("Owner",this.privateKeyOwnerWallet);
        this.genesis = new Wallet("Genesis",this.privateKeyGenesisWallet);
        console.log(this.owner)
        this.getBlockchain();
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
            let nonce : number = 0;
            
            do{
                block.nonce = nonce
                block.hash = block.getHash();
                console.log(block.isValid(0));
                console.log(nonce)
                nonce += 1;
            }while(!block.isValid(0).status)
            
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
        //TODO : trazer mais segurança para carteira do owner para proteger sua privateKey
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

    getMemPool() : TransactionEntry[]{
        return this.mempool;
    }


    addTransactions(txEntry : TransactionEntry) : void {


        const txFee : Transaction = txEntry.txFee;
        const txRegular : Transaction = txEntry.txRegular;

        if(this.mempool.some((tx)=>tx.txRegular.from == txRegular.from)) return;

        if(txEntry.isValid().status){
            if(txFee.isValid(txFee.getMessage()) && txRegular.isValid(txRegular.getMessage())){
                this.mempool.push(txEntry);
            }
        }

    
    }


    /**
     * 
     * @returns Retorna as informações do próximo bloco a ser minerado.
     */
    getNextBlock(): BlockInfo | null {

        if(!this.mempool.length) return null;


        const transactions : Transaction[] = [] as Transaction[];

        const transactionsEntry: TransactionEntry[] = this.mempool.slice(0,2);
        
        transactionsEntry.forEach((txEntry)=>{
            transactions.push(txEntry.txFee);
            transactions.push(txEntry.txRegular);
        })
    
        // Define o próximo bloco
        const nextBlock: BlockInfo = {
            index: this.nextIndex,
            previousHash: this.blocks[this.blocks.length - 1].hash,
            transactions: transactions,
            difficulty: Blockchain.difficulty,
        };
    
        return nextBlock;
    }

    transactionFee(miner : string) : Transaction | null{

        const txFee : Transaction = new Transaction({
            to:miner,
            from:this.owner.publicKey,
            value:1,
            type:TransactionType.FEE
        } as Transaction)

        txFee.signature = this.owner.signMessage(txFee.getMessage());
        const isValid : Validation = txFee.isValid(txFee.getMessage());
        if(isValid.status) return txFee;

        return null;

    }
    

    /**
     * 
     * @param miner Carteira do Minerador
     * @param nonce 
     * @returns 
     */
    addBlock(
        miner: string,
        nonce: number
    ) : AddBlockResponse
    {   

        const blockResponse : AddBlockResponse = {} as AddBlockResponse;

        const block: Block = new Block({} as Block);
        const nextBlock: BlockInfo | null = this.getNextBlock();
        if (!nextBlock?.transactions.length){

            blockResponse.block = block;
            blockResponse.isValid = new Validation(false,'No transactions in the mempool')
            return blockResponse;
        }
    
        const transactions: Transaction[] = nextBlock.transactions;
        
        const transactionMinerFees : Transaction[] = nextBlock.transactions
        .filter((tx) => tx.type == TransactionType.FEE);


        transactionMinerFees.forEach((tx,index,array)=>{

            let transaction : Transaction | null = this.transactionFee(miner);
            if(transaction){
                transactions.push(transaction);
            }
            
        })

        const txs : Transaction[] = transactions.filter((tx)=>tx.isValid(tx.getMessage()).status == true);

        block.index = nextBlock.index;
        block.transactions = txs;
        block.miner = miner;
        block.nonce = nonce;
        block.previousHash = nextBlock.previousHash;
        block.hash = block.getHash();
    
        const isValid: Validation = block.isValid(Blockchain.difficulty);
    
        if (isValid.status){
            this.blocks.push(block);
            this.mempool.splice(0,4);
            this.nextIndex+=1;
            this.saveBlockchain();
        }

        console.log(block)

        blockResponse.block = block;
        blockResponse.isValid = isValid;
    
        return blockResponse;
    }
    


}