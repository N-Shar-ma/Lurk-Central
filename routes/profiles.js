const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Profile = require("../models/profile")
const { checkAuthenticated, checkNotAuthenticated } = require("../middleware/authentication")


router.get("/", checkAuthenticated, async (req, res) => { 
    try {
        const profiles = await Profile.find({ user: req.user.id }).exec()
        res.render("profiles/list", { profiles, user: req.user })
    } catch (e) {
        console.error(e)
        res.sendStatus(404)
    }
})

router.get("/delete", async (req, res) => { // DEV ONLY
    await Profile.deleteMany()
    const profiles = await Profile.find()
    res.json(profiles)
})

router.get("/new", checkAuthenticated, (req, res) => {
    const profile = new Profile()
    res.render("profiles/new", { user: req.user, profile: profile.toObject({ getters: true }) })
})

router.post("/", checkAuthenticated, async (req, res) => {
    try {
        const profile = await Profile.create(req.body)
        res.json({ id: profile.id })
    } catch (e) {
        console.error(e)
        res.redirect("/profiles")
    }
})

router.get("/:id", checkAuthenticated, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id).exec()
        res.render("profiles/view", { profile: profile.toObject({ getters: true }), user: req.user })
    } catch (e) {
        console.error(e)
        res.redirect("/profiles")
    }
})

router.put("/:id", checkAuthenticated, async (req, res) => {
    try {
        let profile = await Profile.findByIdAndUpdate(req.params.id, req.body)
        res.json({ id: profile.id })
    } catch (e) {
        console.error(e)
        res.sendStatus(404)
    }
})

router.delete("/:id", checkAuthenticated, async (req, res) => {
    try {
        await Profile.findByIdAndDelete(req.params.id)
        res.redirect("/profiles")
    } catch (e) {
        console.error(e)
        res.redirect("/profiles")
    }
})

router.get("/:id/edit", checkAuthenticated, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id).exec()
        res.render("profiles/edit", { user: req.user, profile: profile.toObject({ getters: true }) })
    } catch (e) {
        console.error(e)
        res.redirect("/profiles")        
    }
})

module.exports = router