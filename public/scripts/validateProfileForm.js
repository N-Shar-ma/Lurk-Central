import * as embedders from "./embedFeed.js"

const addPersonForm = document.getElementById("add-person")

const accountCheckboxes = [...addPersonForm.querySelectorAll("[type='checkbox']")]

accountCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", e => {
        toggleAccountInputRequired(checkbox)
    })
})
addPersonForm.addEventListener("submit", async e => {
    e.preventDefault()
    const profileName = document.getElementById("profile-name").value.trim()
    if(!profileName) return alert("A Profile Name is required")
    const accountsToAdd = getAccountsToAdd(accountCheckboxes)
    if(accountsToAdd.length < 1) return alert("Add at least one social media account")
    for(const account of accountsToAdd) {
        if(!(await validateAccount(account))) {
            return
        }
    }
    const profileObject = {
        name : profileName,
        accounts: {},
        user: userId
    }
    accountsToAdd.forEach(({socialMediaPlatform, userHandle}) => {
        profileObject.accounts[socialMediaPlatform] = userHandle
    })
    const res = await fetch(addPersonForm.action, {
        method: addPersonForm.dataset.method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(profileObject)
    })
    const profileId = (await res.json()).id
    console.log(res.json())
    window.location = `/profiles/${profileId}`
})

function toggleAccountInputRequired (checkbox) {
    const accountInput = checkbox.parentElement.querySelector(".user-handle-input")
    accountInput.required = !accountInput.required
    accountInput.focus() // side effect!!
}



function getAccountsToAdd (accountCheckboxes) {
    const checkedAccountCheckboxes = accountCheckboxes.filter(checkbox => checkbox.checked)
    const accountsToAdd = checkedAccountCheckboxes.map(checkbox => (
        {
            socialMediaPlatform : checkbox.parentElement.dataset.socialMediaPlatform,
            userHandle : checkbox.parentElement.querySelector(".user-handle-input").value.trim().split("@").join("")
        }
        ))
    return accountsToAdd
}

async function validateAccount ({ socialMediaPlatform, userHandle }) {
    const embedFunction = `embed${socialMediaPlatform}Stuff`
    const isValid = await embedders[embedFunction](userHandle)
    return isValid
}
