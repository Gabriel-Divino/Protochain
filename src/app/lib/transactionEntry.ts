import Transaction from "./transaction";
import { TransactionType } from "./transactionType";
import Validation from "./validation";



/**
 * Classe para entrada de transações na mempool
 */
export default class TransactionEntry{


    txRegular : Transaction;
    txFee : Transaction;


    constructor(
        txRegular : Transaction,
        txFee : Transaction
    ){

        this.txRegular = txRegular || new Transaction({type:TransactionType.REGULAR} as Transaction);
        this.txFee = txFee || new Transaction({type:TransactionType.FEE} as Transaction);;

    }

    /**
     * 
     * @returns Valida se as transações estão de acordo.
     */
    isValid() : Validation{

        if(this.txRegular.type !== TransactionType.REGULAR) 
            return new Validation(false,'Regular transaction must be of regular type');

        if(this.txFee.type !== TransactionType.FEE)
            return new Validation(false,'Fee transaction must be of fee type');


        const validationTxRegular : 
            Validation = this.txRegular.isValid(this.txRegular.getMessage());

        if(!validationTxRegular.status){
            return new Validation(false,`TxRegular - ${validationTxRegular.message}`);
        }
            
        const validationTxFee : Validation = this.txFee.isValid(this.txFee.getMessage());

        if(!validationTxFee.status){
            return new Validation(false,`TxFee -  ${validationTxFee.message}`);
        }
            

        if(this.txFee.from !== this.txRegular.from){
            return new Validation(false,'Transactions must be from the same sender');
        }
            
        return new Validation(true,'The transactions are in agreement');

    }


}