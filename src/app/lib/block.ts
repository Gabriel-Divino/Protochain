import Transaction from "./transaction";
import sha256 from 'crypto-js/sha256';


/**
 * Classe Block
 */
export  default class Block{

    index:number;
    timestamp : number;
    hash : string;
    miner : string;
    previousHash : string;
    transactions : Transaction[];
    nonce : number;

    constructor(block : Block){
        
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.miner = block?.miner || "";
        this.previousHash = block?.previousHash || "";
        this.transactions = block.transactions || [] as Transaction[];
        this.nonce = block.nonce || 0;
        this.hash = block?.hash || ""

    }

    /**
     * 
     * @returns Retorna o hash do Bloco
     */
    getHash(): string {
        const txs = this.transactions && this.transactions.length
            ? this.transactions.map(tx => tx.signature).reduce((a, b) => a + b)
            : "";
        return sha256(this.index + txs + this.timestamp + this.previousHash + this.nonce + this.miner).toString();
    }


    /**
     * Valida se o bloco é valido.
     * @returns 
     */
    isValid() : boolean{
        if(!this.hash) return false;
        if(!this.miner) return false;

        return true;
    }


}