import { ec as EC } from 'elliptic';


/**
 * Nosso cliente de acesso a Blockchain
 */
export default class Wallet {

  name: string;
  privateKey: string;
  publicKey: string;

  constructor(name: string = "anonymous" , wifOrPrivateKey?: string) {
    const ec = new EC('secp256k1'); // Usando a curva secp256k1 (comum em Bitcoin)

    let keyPair;

    if (wifOrPrivateKey) {
      if (wifOrPrivateKey.length === 64) {
        // Se a chave fornecida for no formato hexadecimal de 64 caracteres (private key)
        keyPair = ec.keyFromPrivate(wifOrPrivateKey, 'hex');
      } else {
        // Caso você tenha uma chave WIF, você precisaria de um método para decodificá-la, 
        // mas vamos simplificar para focar na chave privada hexadecimal.
        throw new Error('Chave WIF não suportada diretamente.');
      }
    } else {
      // Caso não forneça uma chave, gera-se uma chave aleatória
      keyPair = ec.genKeyPair();
    }

    // Define a chave privada e pública em formato hexadecimal
    this.privateKey = keyPair.getPrivate('hex');
    this.publicKey = keyPair.getPublic('hex');
    this.name = name;
  }

  /**
   * Método para assinar uma mensagem com a chave privada
   * @param message 
   * @returns 
   */
  signMessage(message: string): string {
    const ec = new EC('secp256k1');
    const keyPair = ec.keyFromPrivate(this.privateKey, 'hex');
    const messageHash = ec.hash().update(message).digest(); // Cria o hash da mensagem
    const signature = keyPair.sign(messageHash);

    return signature.toDER('hex'); // Retorna a assinatura em formato DER (hex)
  }

  /**
   * 
   * @param message 
   * @param signature 
   * @param publicKey 
   * @returns 
   */
  static verifySignature(message: string, signature: string, publicKey: string): boolean {
    const ec = new EC('secp256k1');
    const key = ec.keyFromPublic(publicKey, 'hex'); // Chave pública do signatário
    const messageHash = ec.hash().update(message).digest(); // Cria o hash da mensagem

    // Verifica a assinatura diretamente sem conversão extra
    return key.verify(messageHash, signature); // A assinatura já está no formato correto
  }

}

