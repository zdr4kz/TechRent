-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS techrent_db;
USE techrent_db;

-- 1. TABELA DE USUÁRIOS
-- Armazena todos os perfis (Cliente, Administrador e Técnico)
-- A diferenciação é feita pela coluna 'nivel_acesso'
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Armazenar o Hash do JWT
    nivel_acesso ENUM('cliente', 'admin', 'tecnico') DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE EQUIPAMENTOS (PRODUTOS)
-- Contém os itens disponíveis para aluguel.
-- O campo 'status' é essencial para a lógica do Técnico e do Cliente.
CREATE TABLE equipamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50), -- Ex: Laptop, Projetor, Tablet
    preco_diaria DECIMAL(10, 2) NOT NULL,
    -- 'disponivel': visível para cliente
    -- 'alugado': bloqueado para novas reservas
    -- 'manutencao': visível apenas para Admin/Técnico
    status ENUM('disponivel', 'alugado', 'manutencao') DEFAULT 'disponivel',
    descricao TEXT
);

-- 3. TABELA DE ALUGUÉIS (RESERVAS)
-- Esta tabela faz a relação N:N entre Usuários e Equipamentos
CREATE TABLE alugueis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    equipamento_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    status_reserva ENUM('pendente', 'ativo', 'finalizado', 'cancelado') DEFAULT 'pendente',
    
    -- Relação: Um aluguel pertence a um usuário (cliente)
    CONSTRAINT fk_usuario_aluguel FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
        
    -- Relação: Um aluguel está vinculado a um equipamento específico
    CONSTRAINT fk_equipamento_aluguel FOREIGN KEY (equipamento_id) 
        REFERENCES equipamentos(id) ON DELETE CASCADE
);

-- 4. TABELA DE LOGS/MANUTENÇÃO (OPCIONAL PARA O TÉCNICO)
-- Útil para o Técnico registrar o que foi feito no equipamento.
-- Se o tempo estiver curto, pode ser ignorada, focando apenas no status da tabela equipamentos.
CREATE TABLE historico_manutencao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipamento_id INT NOT NULL,
    tecnico_id INT NOT NULL,
    descricao_reparo TEXT,
    data_manutencao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_eq_manutencao FOREIGN KEY (equipamento_id) 
        REFERENCES equipamentos(id) ON DELETE CASCADE,
    CONSTRAINT fk_tec_manutencao FOREIGN KEY (tecnico_id) 
        REFERENCES usuarios(id)
);