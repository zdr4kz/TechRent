// =============================================
// ROTAS DE AUTENTICAÇÃO
// =============================================
// Rotas públicas — não exigem token JWT.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const middlewareAuth = require('../middlewares/auth');

// POST /auth/registro - cria uma conta
router.post('/registro', authController.registro);

// POST /auth/login - autentica e retorna o token JWT
router.post('/login', authController.login);



router.get("/", middlewareAuth.autenticar, middlewareAuth.autorizar('admin', 'tecnico', 'cliente'), (req, res) => {
    res.json({
        mensagem: `rota protegida, você está autenticado e autorizado! ${req.usuario.nome}`
    })
})

module.exports = router;
