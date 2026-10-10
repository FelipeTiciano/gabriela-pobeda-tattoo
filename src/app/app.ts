
import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData
} from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

registerLocaleData(localePt, 'pt-BR');

interface Agendamento {
  id: number;
  cliente: string;
  data: string;
  horario: string;
  tatuagem: string;
  valor: number;
  sinal: number;
  observacoes: string;
  status: 'Ativo' | 'Cancelado';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly chaveStorage = 'gabriela-pobeda-agendamentos';

  dataAtual = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  agendamentos: Agendamento[] = this.carregarAgendamentos();

  mostrarFormulario = false;
  erroFormulario = '';

  form = this.formularioVazio();

  get totalAtivos(): number {
    return this.agendamentos.filter(
      item => item.status === 'Ativo' && item.data === this.dataISO()
    ).length;
  }

  get proximoHorario(): string {
    const proximos = this.agendamentos
      .filter(
        item =>
          item.status === 'Ativo' &&
          item.data === this.dataISO()
      )
      .sort((a, b) => a.horario.localeCompare(b.horario));

    return proximos[0]?.horario ?? '--:--';
  }

  get totalPrevisto(): number {
    return this.agendamentos
      .filter(
        item =>
          item.status === 'Ativo' &&
          item.data === this.dataISO()
      )
      .reduce((total, item) => total + item.valor, 0);
  }

  private dataISO(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private formularioVazio() {
    return {
      cliente: '',
      data: this.dataISO(),
      horario: '',
      tatuagem: '',
      valor: 0,
      sinal: 0,
      observacoes: ''
    };
  }

  private carregarAgendamentos(): Agendamento[] {
    try {
      const dados = localStorage.getItem(this.chaveStorage);

      if (dados !== null) {
        const registros: unknown = JSON.parse(dados);

        if (Array.isArray(registros)) {
          return registros as Agendamento[];
        }
      }
    } catch {
      console.warn('Não foi possível carregar os agendamentos salvos.');
    }

    const hoje = this.dataISO();

    return [
      {
        id: 1,
        cliente: 'Marina Souza',
        data: hoje,
        horario: '14:00',
        tatuagem: 'Flores delicadas',
        valor: 350,
        sinal: 50,
        observacoes: '',
        status: 'Ativo'
      },
      {
        id: 2,
        cliente: 'Camila Lima',
        data: hoje,
        horario: '16:00',
        tatuagem: 'Lua e flores',
        valor: 280,
        sinal: 50,
        observacoes: '',
        status: 'Ativo'
      }
    ];
  }

  private salvarDados(): void {
    try {
      localStorage.setItem(
        this.chaveStorage,
        JSON.stringify(this.agendamentos)
      );
    } catch {
      this.erroFormulario =
        'Não foi possível salvar os dados neste navegador.';
    }
  }

  novoAgendamento(): void {
    this.form = this.formularioVazio();
    this.erroFormulario = '';
    this.mostrarFormulario = true;
  }

  salvarAgendamento(): void {
    this.erroFormulario = '';

    if (
      !this.form.cliente.trim() ||
      !this.form.data ||
      !this.form.horario ||
      !this.form.tatuagem.trim()
    ) {
      this.erroFormulario =
        'Preencha todos os campos obrigatórios.';
      return;
    }

    if (
      !Number.isFinite(Number(this.form.valor)) ||
      !Number.isFinite(Number(this.form.sinal)) ||
      Number(this.form.valor) < 0 ||
      Number(this.form.sinal) < 0 ||
      Number(this.form.sinal) > Number(this.form.valor)
    ) {
      this.erroFormulario =
        'Confira os valores. O sinal não pode superar o valor da sessão.';
      return;
    }

    const conflito = this.agendamentos.some(
      item =>
        item.status === 'Ativo' &&
        item.data === this.form.data &&
        item.horario === this.form.horario
    );

    if (conflito) {
      this.erroFormulario =
        'Já existe um agendamento ativo nessa data e horário.';
      return;
    }

    this.agendamentos.push({
      id: Date.now(),
      ...this.form,
      valor: Number(this.form.valor),
      sinal: Number(this.form.sinal),
      status: 'Ativo'
    });

    this.agendamentos.sort(
      (a, b) =>
        a.data.localeCompare(b.data) ||
        a.horario.localeCompare(b.horario)
    );

    this.salvarDados();

    if (this.erroFormulario) {
      this.agendamentos = this.agendamentos.filter(
        item => item.id !== Date.now()
      );
      return;
    }

    this.mostrarFormulario = false;
    this.form = this.formularioVazio();
  }

  alternarStatus(id: number): void {
    const item = this.agendamentos.find(a => a.id === id);

    if (item) {
      const statusAnterior = item.status;

      item.status =
        item.status === 'Ativo' ? 'Cancelado' : 'Ativo';

      this.salvarDados();

      if (this.erroFormulario) {
        item.status = statusAnterior;
      }
    }
  }
}
