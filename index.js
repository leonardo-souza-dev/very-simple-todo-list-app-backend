const express = require("express");
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors');

const app = express();
app.use(bodyParser.json())
app.use(cors())

let db = new sqlite3.Database(':memory:', (err) => {
  if (err)  console.error(err.message)
  console.log('Connected to the in-memory SQlite database. ')
});

db.serialize(() => {
  db.run('CREATE TABLE tasks (id INTEGER PRIMARY KEY, message TEXT, done BOOLEAN)')

  runInsert('INSERT INTO tasks (message, done) VALUES ("Wash dishes", 0)')
  runInsert('INSERT INTO tasks (message, done) VALUES ("Do laundry", 1)')
})

function runInsert(query) {
  const stmt = db.prepare(query)
  stmt.run()
  stmt.finalize()
}

app.get("/tasks", (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return;
    }
    res.json(rows)
  })
})

app.get("/tasks/:id", (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(row)
  })
})

app.post("/tasks", (req, res) => {
  console.log(req.body)

  if (!req.body.message) {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  const stmt = db.prepare('INSERT INTO tasks (message, done) VALUES (?, ?)')
  stmt.run(req.body.message, req.body.done)
  stmt.finalize()
  res.json({ sucess: true })
})

const port = process.env.TODOLIST_LOCAL_DEV_PORT || 80;
console.log("port", port)

app.listen(port, () => {
  console.log("Server running on port 3000")
})