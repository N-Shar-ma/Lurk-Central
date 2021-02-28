const mongoose = require("mongoose")
const User = require("./user")

const profileSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    accounts : {
        Twitter : {
            type: String,
        },
        Facebook : {
            type: String,
        },
        Instagram : {
            type: String,
        },
    },
    user : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    }
})

profileSchema.pre("save", async function(next) {
    try {
        const allProfilesOfUser = await Profile.find({ user: this.user }).exec()
        const sameNamedProfiles = allProfilesOfUser.filter(profile => profile.name === this.name && profile.id !== this.id)
        if(sameNamedProfiles.length > 0) {
            return next(new Error("You already have a profile with the same name. Choose another name if you want to create a new profile"))
        }
        if(!this.accounts.Twitter && !this.accounts.Facebook && !this.accounts.Instagram) {
            return next(new Error("Add at least one social media account to this profile"))
        }
        else {
            next()
        } 
    } catch (e) {
        next(e)
    }    
})

const Profile = mongoose.model("Profile", profileSchema) 

module.exports = Profile