const express = require("express")
const app = express();

app.use(express.urlencoded({extended:true}))

app.set("view engine", "ejs")

const messages = [
  {
    text: "Hi there!",
    user: "Amando",
    added: new Date()
  },
  {
    text: "Hello World!",
    user: "Charles",
    added: new Date()
  }
];


const path = require("node:path");
const { measureMemory } = require("node:vm");

app.get('/', (req,res) => {
    console.log("working");
    res.render("index", { messages:messages });
})

app.get('/new', (req,res) =>{
    console.log("accessed /new")
    res.render("form")
})
app.post('/new', (req,res,next) =>{
    messages.push({text: req.body.message, user: req.body.author, added: new Date()})
    res.redirect("/")
})
app.get("/message/:id", (req, res) => {
    const id = Number(req.params.id);
    const message = messages[id];

    res.send(message)
});

app.listen(3000)