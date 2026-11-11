const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexão com o MySQL do XAMPP
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Senha padrão do XAMPP costuma ser vazia
    database: 'eletro_kurumin'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL com sucesso!');
});

// Autenticação (Login)[cite: 1]
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM USUARIO WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.json({ success: true, id_usuario: results[0].id_usuario });
        } else {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
    });
});

// CRUD - Listar Componentes[cite: 1]
app.get('/componentes', (req, res) => {
    db.query('SELECT * FROM COMPONENTE', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// CRUD - Criar Componente[cite: 1]
app.post('/componentes', (req, res) => {
    const { id_categoria, id_usuario, nome, descricao, preco, quantidade_estoque } = req.body;
    const query = 'INSERT INTO COMPONENTE (id_categoria, id_usuario, nome, descricao, preco, quantidade_estoque) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [id_categoria, id_usuario, nome, descricao, preco, quantidade_estoque], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true, id_componente: result.insertId });
    });
});

// Relatório - Lista com Valor Total[cite: 1]
app.get('/relatorio', (req, res) => {
    db.query('SELECT nome, preco, quantidade_estoque, (preco * quantidade_estoque) AS valor_total_item FROM COMPONENTE', (err, results) => {
        if (err) return res.status(500).send(err);
        let valorTotalEstoque = results.reduce((acc, item) => acc + parseFloat(item.valor_total_item), 0);
        res.json({ itens: results, valorTotalEstoque });
    });
});

app.listen(3000, () => {
    console.log('Servidor a rodar na porta 3000 (http://localhost:3000)');
});