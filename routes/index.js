const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Profile = require("../models/profile")
const bcrypt = require("bcrypt")
const passport = require("passport")
const { checkAuthenticated, checkNotAuthenticated } = require("../middleware/authentication")

router.get("/", checkAuthenticated, async (req, res) => {
    try {
        const profiles = await Profile.find({ user: req.user.id }).exec()
        res.render("index", { user: req.user, profiles: profiles })
    } catch (e) {
        console.log(e)
        res.render("index", { user: req.user })
    }
})

router.get("/signup", checkNotAuthenticated, (req, res) => {
    res.render("signUp")
})

router.post("/signup", checkNotAuthenticated, async (req, res) => {
    try {
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login")
    } catch (e) {
        console.log(e)
        res.redirect("/signup")
    }
})

router.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login")
})

router.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

router.get("/logout", checkAuthenticated, (req, res) => {
    req.logout()
    res.redirect("/login")
})

module.exports = router