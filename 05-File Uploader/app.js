const express = require("express")
const session = require("express-session")
const { PrismaClient } = require("@prisma/client")
const { PrismaSessionStore }= require("@quixo3/prisma-session-store")
const prisma = new PrismaClient();
const app = express();
const passport = require("passport");
const authRouter = require("./routes/authRouter");

require("./passport")

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:false}))

app.use(
    session({
        secret:"some-secret",
        resave: false,
        saveUninitialized: false,
        store: new PrismaSessionStore(prisma,{
            checkPeriod: 2*60*1000,
            dbRecordIdIsSessionId: true,
        })
    })
)

app.use(passport.initialize());
app.use(passport.session())
app.use("/", authRouter)

app.listen(PORT, () =>{
    console.log(`Server running on PORT: ${PORT}`)
})