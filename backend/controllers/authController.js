// =============================================
// CONTROLLER DE AUTENTICAÇÃO
// =============================================
// TODO (alunos): implementar as funções registro e login.
//
// Dicas:
//   - Use bcryptjs para criptografar a senha antes de salvar (registro)
//   - Use bcryptjs para comparar a senha no login (bcrypt.compare)
//   - Use jsonwebtoken (jwt.sign) para gerar o token após login bem-sucedido
//   - O payload do token deve ter: id, nome, email, nivel_acesso
//   - NUNCA coloque a senha no payload do token!

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { create, read } = require('../config/database.js')

// POST /auth/registro - cria um novo usuário
const registro = async (req, res) => {
  try{
    const { nome, email, senha } = req.body


    //  VERIFICA SE TEM UM EMAIL EXISTENTE
    const user = await read("usuarios")
    if(user.email = email){
      return res.status(400).json({
        sucesso: false,
        mensagem: "email já cadastrado!"
      })
    }
    
    // CRIPTOGRAFA A SENHA
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt)
    

    // CRIA O ARQUIVO DATA COM A SENHA JÁ CRIPTOGRAFA E COM NIVEL DE ACESSO CLIENTE
    const data = {
      nome: nome,
      email: email,
      senha: senhaCriptografada,
      nivel_acesso: "cliente"
    }


    // CRIA O USUÁRIO NO BANCO 
    await create("usuarios", data)
    res.status(200).json({
        sucesso: true,
        mensagem: "você foi registrado com sucesso!"
    })

  } 
  catch(e) {
    res.status(500).json({
      sucesso: false,
      mensagem: "erro no sistema",
      erro: e
    })
  } 
  


  // TODO
  
};

// POST /auth/login - autentica e retorna JWT
const login = async (req, res) => {
  // TODO
  res.json({ mensagem: 'login - não implementado' });
};

module.exports = { registro, login };
