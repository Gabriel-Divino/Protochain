import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() query: string = '';

  constructor(private router: Router) {}

  search(): void {
    if (this.query.startsWith('bk')) {
      const blockId = this.query.substring(2); // Remover 'bk' e obter o ID do bloco
      this.router.navigate(['/blocks', blockId]); // Redireciona para a rota de blocos
    } else if (this.query.startsWith('tx')) {
      const transactionId = this.query.substring(2); // Remover 'tx' e obter o ID da transação
      this.router.navigate(['/transactions', transactionId]); // Redireciona para a rota de transações
    } else if (this.query.startsWith('w')) {
      const walletId = this.query.substring(1); // Remover 'w' e obter o ID da carteira
      this.router.navigate(['/balances', walletId]); // Redireciona para a rota de carteiras
    } else {
      console.log('Consulta inválida');
    }
  }
}
