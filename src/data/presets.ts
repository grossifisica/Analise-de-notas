import { PresetDataset } from '../types';

export const PRESET_DATASETS: PresetDataset[] = [
  {
    name: 'Notas da Turma (0 a 10)',
    columnName: 'Notas da Prova',
    description: 'Sequência de notas de estudantes em uma avaliação escolar',
    values: [
      7.5, 8.0, 6.5, 9.0, 7.5, 5.0, 8.5, 7.5, 6.0, 10.0,
      4.5, 7.5, 8.0, 9.5, 6.5, 7.0, 8.0, 5.5, 7.5, 8.5,
      9.0, 6.0, 7.0, 8.0, 7.5, 6.5, 8.5, 5.0, 9.0, 7.5
    ],
  },
  {
    name: 'Pesquisa de Satisfação (1 a 5)',
    columnName: 'Avaliação do Atendimento',
    description: 'Pontuações de feedback recebidas de clientes (escala 1 a 5 estrelas)',
    values: [
      5, 4, 5, 3, 5, 4, 4, 5, 2, 5,
      4, 5, 5, 3, 4, 5, 1, 4, 5, 4,
      5, 5, 4, 3, 5, 4, 5, 5, 4, 2,
      5, 4, 5, 4, 5
    ],
  },
  {
    name: 'Lançamento de 2 Dados (Soma 2 a 12)',
    columnName: 'Soma dos Dados',
    description: 'Distribuição binomial/triangular da soma de dois dados',
    values: [
      7, 6, 8, 7, 5, 9, 7, 6, 8, 4,
      10, 7, 7, 6, 8, 5, 9, 7, 3, 11,
      7, 6, 8, 7, 2, 12, 6, 7, 8, 5,
      9, 7, 6, 8, 7, 4, 10, 7, 6, 8
    ],
  },
  {
    name: 'Idades dos Participantes',
    columnName: 'Idade',
    description: 'Amostra de idades em um evento de tecnologia',
    values: [
      22, 25, 28, 24, 31, 28, 22, 26, 29, 35,
      28, 24, 27, 30, 28, 23, 25, 32, 28, 26,
      42, 27, 29, 28, 21, 38, 25, 28, 30, 24
    ],
  },
  {
    name: 'Tempo de Espera (minutos)',
    columnName: 'Tempo de Espera (min)',
    description: 'Minutos aguardando em fila de atendimento',
    values: [
      12.5, 15.0, 8.2, 20.4, 14.1, 11.8, 15.0, 9.5, 18.2, 14.0,
      15.0, 16.5, 12.0, 22.1, 10.5, 15.0, 13.4, 17.0, 15.0, 8.9,
      19.5, 14.5, 15.0, 11.2, 25.0, 13.0, 16.0, 15.0, 12.8, 14.2
    ],
  }
];
