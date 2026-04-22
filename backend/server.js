// =============================================
// PONTO DE ENTRADA DO SERVIDOR
// =============================================
// Este é o arquivo principal. Ele:
//   1. Carrega as variáveis de ambiente (.env)
//   2. Configura o Express e seus middlewares globais
//   3. Registra as rotas da aplicação
//   4. Inicia o servidor na porta definida no .env

// dotenv deve ser o PRIMEIRO require, para que as variáveis
// fiquem disponíveis em todos os outros módulos
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ---- Importação das rotas ----
const authRoutes         = require('./routes/authRoutes');
const equipamentosRoutes = require('./routes/equipamentosRoutes');
const chamadosRoutes     = require('./routes/chamadosRoutes');
const manutencaoRoutes   = require('./routes/manutencaoRoutes');
const dashboardRoutes    = require('./routes/dashboardRoutes');

const app = express();

// ---- Middlewares globais ----

// Permite que o Express leia o corpo das requisições em JSON
app.use(express.json());
app.use(cors());

// Middleware para tratar erros de body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[Erro de Body]', err.message);
    return res.status(400).json({ sucesso: false, mensagem: 'Formato JSON inválido' });
  }
  next();
});

// ---- Registro das rotas ----
// Cada prefixo aponta para um arquivo de rotas separado
app.use('/auth',         authRoutes);
app.use('/equipamentos', equipamentosRoutes);
app.use('/chamados',     chamadosRoutes);
app.use('/manutencao',   manutencaoRoutes);
app.use('/dashboard',    dashboardRoutes);

// ---- Rota de health check ----
// Útil para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({ mensagem: 'TechRent API está rodando!' });
});

// ---- Inicialização do servidor ----
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
