import Transaction from "./transaction";
import sha256 from 'crypto-js/sha256';
import Blockchain from "./blockchain";
import Validation from "./validation";

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
    isValid(difficulty: number) : Validation{

        if(!this.hash) return new Validation(false,"Invalid Hash");
        if(!this.miner) return new Validation(false,"No Miner");
        if(!this.transactions || !this.transactions.length) return new Validation(false,"No transactions available");
        var startHash : string = "";

        for(let i  = 1;i<=difficulty;i++){
            startHash+="0"
        };

        if(!this.hash.startsWith(startHash)) return new Validation(false,"Invalid Nonce");

        return new Validation();
    }


}