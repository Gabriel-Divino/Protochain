

/**
 * Classe de Validação Geral da nossa Blockchain
 */
export default class Validation{

    status : boolean;
    message : string

    constructor(
        status : boolean = true,
        message : string = 'success'
    ){
        this.status = status;
        this.message = message;
    }

}