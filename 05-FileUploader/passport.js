const passport = require ("passport")
const LocalStrategy = require("passport-local").Strategy
const {PrismaClient} = require("@prisma/client")


const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

passport.use(
    new LocalStrategy(async(username,password,done) => {
        try{
            const user = await prisma.user.findUnique({
                where: {username}
            })

            if(!user){
                return done(null,false)
            }

            const match = await bcrypt.compare(password, user.password)
            if(!match){
                return done(null,false)
            }

            return done(null,user)
        } catch(err){
            return done(err)

        }
    })
)

passport.serializeUser((user, done) =>{
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try{
        const user = await prisma.user.findUnique({
            where: { id },
        })

        done(null, user);
    } catch(err){
        done(err)
    }
})