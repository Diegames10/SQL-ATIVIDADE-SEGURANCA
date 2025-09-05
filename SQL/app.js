import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Necessário para resolver __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares para entender JSON e formulários
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded

// Servir arquivos estáticos (HTML, CSS, JS da pasta "public")
app.use(express.static(path.join(__dirname, "public")));

// Configuração do banco SQLite
const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err.message);
  } else {
    console.log("Banco conectado com sucesso!");
  }
});

// Criar tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// 📌 Rota de cadastro
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Usuário e senha são obrigatórios.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send("Erro ao cadastrar usuário. Talvez já exista.");
        }
        res.send("Usuário cadastrado com sucesso!");
      }
    );
  } catch (error) {
    res.status(500).send("Erro interno no servidor.");
  }
});

// 📌 Rota de login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Usuário e senha são obrigatórios.");
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro no banco de dados.");
    }
    if (!row) {
      return res.status(400).send("Usuário não encontrado.");
    }

    const validPassword = await bcrypt.compare(password, row.password);
    if (!validPassword) {
      return res.status(401).send("Senha incorreta.");
    }

    res.send("Login realizado com sucesso!");
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
