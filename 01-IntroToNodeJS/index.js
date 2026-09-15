const http = require ("http")
const fs = require("fs");

const server = http.createServer(function (req, res) {
    if(req.url === "/"){
        const html = fs.readFileSync("index.html")
        res.end(html);
    }
    else if(req.url === "/about"){
        const html = fs.readFileSync("about.html")
        res.end(html);
    }
    else if(req.url === "/contact-me"){
        const html = fs.readFileSync("contact-me.html")
        res.end(html);
    }
    else{
        const html = fs.readFileSync("404.html")
        res.end(html);
    }
});

server.listen(8080);