import { Injectable } from "@angular/core";
import Block from "./block";
import Wallet from "./wallet";
import Transaction from "./transaction";
import { TransactionType } from "./transactionType";
import Validation from "./validation";


interface BlockInfo{

    index:number;
    previousHash:string;
    transactions: Transaction[];
    difficulty : number;


}

export default class Blockchain{

    private blocks : Block[] =  [] as Block[];
    nextIndex : number =  0;
    private owner : Wallet;
    private genesis : Wallet;
    private privateKeyGenesisWallet : string = "15bb850d56d744da6ad15725034118c9881785d7004c6f0f4f860aaba1e5f9a4";
    private privateKeyOwnerWallet : string = "15441fec09cd9010eb753075a652174ccd9906409508a986c53d00f357b76ff9";
    private mempool : Transaction[] = [] as Transaction[];
    static difficulty : number = 0;

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

    getMemPool() : Transaction[]{
        return this.mempool;
    }


    addTransactions(transaction : Transaction) : void {

        if(transaction.isValid(transaction.getMessage()).status == true){
            this.mempool.push(transaction);
        }
    }


    /**
     * 
     * @returns Retorna as informações do próximo bloco a ser minerado.
     */
    getNextBlock(): BlockInfo | null {

        if(!this.mempool.length) return null;

        // Obtém as transações regulares limitadas a 2
        const transactionsRegular: Transaction[] = this.mempool
            .filter((tx) => tx.type === TransactionType.REGULAR)
            .slice(0, 4);
    
        // Obtém as transações do tipo fee
        const transactionsFee: Transaction[] = this.mempool
            .filter((tx) => tx.type === TransactionType.FEE);
    
        // Combina as transações regulares com as transações de fee associadas
        const transactions: Transaction[] = [];
    
        transactionsRegular.forEach((regularTx) => {
            // Adiciona a transação regular
            transactions.push(regularTx);
    
            // Busca as transações de fee associadas pelo campo "from"
            const associatedFees = transactionsFee.filter((feeTx) => feeTx.from === regularTx.from);
    
            // Adiciona as transações de fee associadas
            transactions.push(...associatedFees);
        });
    
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
    ): Validation {
        const block: Block = new Block({} as Block);
        const nextBlock: BlockInfo | null = this.getNextBlock();
        if (!nextBlock) return new Validation(false, "There are no transactions in the mempool");
    
        const transactions: Transaction[] = nextBlock.transactions;
    
        const transactionFee: (Transaction | null)[] = transactions
            .filter((tx) => tx?.type == TransactionType.FEE)
            .map((tx) => this.transactionFee(miner));
    
        // Valida se existem transações inválidas
        if (transactionFee.filter((tx) => tx == null).length > 1)
            return new Validation(false, "Invalid transactions");
    
        // Filtra e concatena apenas transações válidas
        const validTransactionFee = transactionFee.filter(
            (tx): tx is Transaction => tx !== null
        );
        transactions.concat(validTransactionFee);
    
        block.index = nextBlock.index;
        block.transactions = nextBlock.transactions;
        block.miner = miner;
        block.nonce = nonce;
        block.previousHash = nextBlock.previousHash;
        block.hash = block.getHash();
    
        const isValid: Validation = block.isValid(Blockchain.difficulty);
    
        if (isValid.status) this.blocks.push(block);
    
        return isValid;
    }
    


}