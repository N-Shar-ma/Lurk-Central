const fbPageTemplate = document.getElementById("fb-page-template");

const igPageTemplate = document.getElementById("ig-page-template");

export async function embedTwitterStuff (userHandle) {
    try {
        const timeline = await twttr.widgets.createTimeline(
            {
                sourceType: "Profile",
                screenName: userHandle
            },
            document.querySelector(".twitter-stuff"),
            {
                chrome: "nofooter",
                height: "600"
            }
        );
        if(!timeline) throw Error("The Twitter page is not available or could not be found")
        return true
    } catch (e) {
        alert(e.message);
        return false
    }
}

export async function embedFacebookStuff (userHandle) {
    try {
        const res = await fetch(`https://graph.facebook.com?id=${userHandle}`)
        const code = (await res.json()).error.code
        if(code === 803) throw Error("This facebook page is not available or could not be found")
        const fbPage = fbPageTemplate.content.cloneNode(true);
        console.log(await fetch(`https:cors-anywhere.herokuapp.com/https:wwww.facebook.com/${userHandle}`))
        if((await fetch(`https:cors-anywhere.herokuapp.com/https:wwww.facebook.com/${userHandle}`)).statuscode === 404) throw Error("This facebook page could not be found")
        fbPage.querySelector("iframe").src = `https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2F${userHandle}&tabs=timeline&width=320&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId`
        document.querySelector(".facebook-stuff").append(fbPage);
        return true        
    } catch (e) {
        alert(e.message);
        return false
    }
}

export async function embedInstagramStuff (userHandle) {
    try {
        const { bio, posts } = await getFilteredInstagramData(userHandle)
        if(bio) appendInstagramBioDiv(bio)
        if(posts.length === 0) document.querySelector(".instagram-stuff").append("No posts available to view")
        else appendInstagramPosts(posts)
        return true
    } catch (e) {
        alert(e.message)
        return false
    }
}

async function getFilteredInstagramData (userHandle) {
    try {
        const userData = await fetchInstagramUserData(userHandle)
        if(userData.is_private) throw Error("This user's Instagram profile is private")
        const bio = getInstagramBio(userData)
        const posts = getInstagramPosts(userData)
        return ({bio, posts})
    } catch (e) {
        throw Error(e.message)
    }
}

async function fetchInstagramUserData (userHandle) {
    try {
        const res = await fetch(`https://www.instagram.com/${userHandle}`);
        if(!res.ok) throw Error(res.status === 404 ? "This Instagram page could not be found" : `Error code ${res.status} occured on trying to access this Instagram page`)
        const resText = await res.text();
        const rawData = resText
        .split("window._sharedData = ")[1]
        .split(";</script>")[0];
        const rawJson = JSON.parse(rawData);
        return rawJson.entry_data.ProfilePage[0].graphql.user
    } catch (e) {
        throw Error(e.message)
    }
}
    
function getInstagramBio (userData) {
    const bio = {}
    if(userData.biography) bio.text = userData.biography
    if(userData.external_url) bio.link = userData.external_url
    return bio    
}

function getInstagramPosts (userData) {
    const posts = userData.edge_owner_to_timeline_media.edges.map(
        (post) => ({
            shortcode : post.node.shortcode,
            caption : post.node.edge_media_to_caption.edges[0]?.node.text || "",
            captionLength : post.node.edge_media_to_caption.edges[0]?.node.text.length || 0,
            captionNewLineCount : post.node.edge_media_to_caption.edges[0]?.node.text.split("\n").length - 1 || 0,
            isIgtv : (post.node.product_type === "igtv" || (post.node.product_type === "clips" && post.node.is_video)),
            aspectRatio : parseInt(post.node.dimensions.width) / parseInt(post.node.dimensions.height)
        })
    )
    return posts
}

function appendInstagramBioDiv (bio)
{
    const bioDiv = document.createElement("div")
    if(bio.text) {
        const bioTextNode = document.createTextNode(bio.text)
        bioDiv.append(bioTextNode)
    }
    if(bio.link) {
        const bioLinkAnchor = document.createElement("a")
        bioLinkAnchor.href = bio.link
        const bioLinkText = bio.link.split("://")[1]
        bioLinkAnchor.innerText = bioLinkText.length > 40 ? bioLinkText.substring(0, 39) + "..." : bioLinkText
        bioDiv.append(bioLinkAnchor)
    }
    document.querySelector(".instagram-stuff").append(bioDiv)
}

function appendInstagramPosts (posts) {
    posts.forEach(post => {
        const igPage = igPageTemplate.content.cloneNode(true);
        igPage.querySelector("iframe").src = `https://www.instagram.com/p/${post.shortcode}/embed/captioned`;
        igPage.querySelector("iframe").height = getInstagramPostHeight(post)
        document.querySelector(".instagram-stuff").append(igPage)
    })    
}

function getInstagramPostHeight (post) {
    const fixedPostWidth = 300
    const basePostHeight = 240
    const picHeight = (fixedPostWidth / post.aspectRatio)
    const captionHeight = (post.captionLength ? 50 : 0) + (post.captionLength * 0.4) + (post.captionNewLineCount * 15)
    const igtvAdjustment = (post.isIgtv ? -130 : 0)
    // if(igtvAdjustment === -130) alert(post.caption)
    const postHeight = basePostHeight + picHeight + captionHeight + igtvAdjustment
    return postHeight
}