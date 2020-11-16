import * as embedders from "./embedFeed.js"

async function load() {
    Object.entries(accounts).forEach(([socialMediaPlatform, userHandle]) => {
        const embedFunction = `embed${socialMediaPlatform}Stuff`
        embedders[embedFunction](userHandle)
    })
}

load()

// const tweetUrl = `https://twitter.com/Interior/status/463440424141459456`;
// const url = `https://cors-anywhere.herokuapp.com/https://publish.twitter.com/oembed?url=${tweetUrl}&omit_script=true`;
// const response = await fetch(url);
// const data = await response.json();
// const html = data.html;
// document.querySelector(".twitter-stuff").innerHTML += html;
// twttr.widgets.load(document.querySelector(".tweets"));
// await twttr.widgets.createTweet(
// "463440424141459456",
// document.querySelector(".twitter-stuff"),
// {
//     theme: "dark"
// }
// );