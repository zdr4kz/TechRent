-- VIEW PARA O CLIENTE (O que ele pode alugar agora)
CREATE VIEW view_equipamentos_disponiveis AS
SELECT id, nome, categoria, preco_diaria, descricao
FROM equipamentos
WHERE status = 'disponivel';

-- VIEW PARA O TÉCNICO (O que precisa de atenção ou está saindo para entrega)
CREATE VIEW view_painel_tecnico AS
SELECT 
    a.id AS aluguel_id,
    u.nome AS cliente,
    e.nome AS equipamento,
    a.data_inicio,
    a.status_reserva
FROM alugueis a
JOIN usuarios u ON a.usuario_id = u.id
JOIN equipamentos e ON a.equipamento_id = e.id
WHERE a.status_reserva IN ('pendente', 'ativo');

-- VIEW PARA O ADMINISTRADOR (Métricas de ocupação)
CREATE VIEW view_resumo_admin AS
SELECT 
    status, 
    COUNT(*) AS total_itens,
    SUM(preco_diaria) AS potencial_receita_diaria
FROM equipamentos
GROUP BY status;