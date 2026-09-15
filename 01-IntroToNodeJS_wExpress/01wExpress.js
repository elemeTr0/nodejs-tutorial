
const express = require("express")
const app = express();
const http = require ("http")
const fs = require("fs");

const PORT = 3000;

app.get("/", (req, res) => { const html = fs.readFileSync("index.html");res.end(html);})
app.get("/about", (req, res) => { const html = fs.readFileSync("about.html");res.end(html);})
app.get("/contact-me", (req, res) => { const html = fs.readFileSync("contact-me.html");res.end(html);})
app.get("/404", (req, res) => { const html = fs.readFileSync("404.html");res.end(html);})

app.listen(PORT, (error)=> {
    if(error) throw error;

    console.log(`Yuppie!!`)
})

// const server = http.createServer(function (req, res) {
//     if(req.url === "/"){
//         const html = fs.readFileSync("index.html")
//         res.end(html);
//     }
//     else if(req.url === "/about"){
//         const html = fs.readFileSync("about.html")
//         res.end(html);
//     }
//     else if(req.url === "/contact-me"){
//         const html = fs.readFileSync("contact-me.html")
//         res.end(html);
//     }
//     else{
//         const html = fs.readFileSync("404.html")
//         res.end(html);
//     }
// });

// server.listen(8080);