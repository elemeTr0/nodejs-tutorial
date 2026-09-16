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

app.get('/', (req,res) => {
    console.log("working");
    res.render("index", { messages:messages });
})

app.get('/new', (req,res) =>{
    console.log("accessed /new")
    res.render("form")
})
app.post('/new', (req,res) =>{
    messages.push({text: req.body.message, user: req.body.author, added: new Date()})
    res.redirect("/")
})
app.post("/delete/:id", (req, res) => {
    const id = Number(req.params.id);

    messages.splice(id, 1);

    res.redirect("/");
});
app.get("/message/:id", (req, res) => {
    const id = Number(req.params.id);
    const message = messages[id];

    res.send(message)
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});