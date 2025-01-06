import { TransactionType } from "./transactionType";
import Validation from "./validation";
import Wallet from "./wallet";
import Blockchain from "./blockchain";


interface TransactionMessage{
    to:string;
    from:string;
    value:number;
    type:TransactionType;
    timestamp : number;
}

/**
 * Nossa classe para realizar transações na blockchain
 */
export default class Transaction{

    to:string;
    from:string;
    value:number;
    type:TransactionType;
    timestamp : number;
    signature : string;

    /**
     * 
     * @param tx 
     */
    constructor(tx : Transaction){

        this.to = tx?.to || "";
        this.from = tx?.from || "";
        this.timestamp = tx?.timestamp || Date.now();
        this.value = tx?.value || 0;
        this.type = tx.type;
        this.signature = tx?.signature || "";
    }


    getMessage() : string {

        const txMessage : TransactionMessage = {

            to:this.to,
            from:this.from,
            timestamp:this.timestamp,
            value:this.value,
            type:this.type
        }

        return JSON.stringify(txMessage);
    }


    /**
     * Valida se uma única transação é valida
     * @param message 
     * @returns 
     */
    isValid(message : string) : Validation{

        const signatureIsValid : boolean = Wallet.verifySignature(message,this.signature,this.from);

        
        if(!signatureIsValid) return new Validation(false,"Signature is invalid");

        const blockchain : Blockchain = new Blockchain();
        const balance : number = blockchain.getBalance(this.from);
        if(balance < this.value) return new Validation(false,"Insufficient balance");
    
        return new Validation();
    }



}