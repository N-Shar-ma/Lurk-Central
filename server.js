if(process.env.NODE_ENV !== "production") require("dotenv").config()

const express = require("express")
const app = express()
const expressLayouts = require("express-ejs-layouts")
const passport= require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

const initializePassport = require("./passport-config")
const User = require("./models/user")

initializePassport(
    passport, 
    async email => await User.findOne({email: email}).exec(), 
    async id => await User.findById(id).exec()
)

const indexRouter = require("./routes/index")
const profilesRouter = require("./routes/profiles")

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set("layout", "layouts/layout")

app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser : true, useUnifiedTopology : true })
const db = mongoose.connection
db.on("error", err => console.error(err))
db.once("open", () => console.log("connected to database"))

app.use("/", indexRouter)
app.use("/profiles", profilesRouter)

app.listen(process.env.PORT || 3000)