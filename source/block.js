(async ()=>{
    let data = {},
        block_html = "",
        fallback_data = { 
            "isBlacklist": true,
            "blacklist": [
                "tiktok", "youtube", 
                "instagram", "roblox", 
                "itch.io", "reddit", 
                "x.com", "web.archive", 
                "myinstants", "game", 
                "discord", "steampowered.com", 
                "steamcommunity.com", "xbox.com", 
                "minecraft", ".github.io", "bluesky",
                "namemc"
            ],  
            "whitelist": [
                "google", "git.", 
                "github.com", "microsoft", 
                "outlook", "account", 
                "udemy", "chatgpt.com", 
                ".mysharepoint.com", "wikipedia.org",
                ".edu"
            ] 
        },
        string_matches = (str,arr)=>{
            for(let s of arr){
                if(str.match(s)){
                    return true
                }
            }
            return false
        },
        fallback_html = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Blocked</title>
</head>
<body>
    <h1>WAIT!!</h1>
    <hr>
    <p style="color:red;">An error ocurred while loading the original page! This is a fallback</p>
    <p>This domain was blocked by ADHD Blocker Extension, you cannot access unless you have a really good excuse</p>
    <p>If you still want to access, please put the reason and you'll get 5 minutes of access whatever you "need"</p>
    <p>Note that everything will be logged later into a file you'll be able to see in the extension page</p>
    <form style="display:flex;flex-direction:column;">
        <label>Reason to access <placeholder type="string" var="domain">example.com</placeholder>:</label>
        <input type="text" id="reason_input">
        <br>
        <button id="button_submit">Submit and access</button>
    </form>
</body>
</html>`,
        dom_parser = new DOMParser()
        
    
    let time_left = await chrome.storage.local.get(["submit_stamp"]);
    if(!time_left.submit_stamp){
        time_left.submit_stamp = 0
    }
    
    try {
        const ___json___ = await chrome.storage.local.get(["config"])
        if(Object.keys(___json___).length <= 0 || !___json___.config){
            data = fallback_data;
            await chrome.storage.local.set({
                "config": fallback_data,
            });
        } else {
            data = ___json___.config
        }

        const ___html___ = await fetch(chrome.runtime.getURL("blocked.html"))
        block_html = await ___html___.text()
    } catch (e) {
        if(Object.keys(data).length <= 0){
           data = fallback_data
        }
        if(!block_html){
            block_html = fallback_html
        }
    } finally {
        //console.log("Script running on:", window.location.hostname, "protocol:", window.location.protocol);
        //console.log("Config loaded:", data);
        if(
            (string_matches(window.location.protocol,["http","https"]) )&&
            (
            (data.isBlacklist && string_matches(window.location.hostname,data.blacklist))||
            (!data.isBlacklist && !string_matches(window.location.hostname,data.whitelist))
            )
        ){
            //console.log((new Date()).valueOf() - time_left.submit_stamp)
            if( (new Date()).valueOf() - time_left.submit_stamp > 300000 ){
                let placeholder_data = {
                    "domain": window.location.hostname
                }
                //console.log(placeholder_data)
                /*
                document.documentElement.innerHTML = dom_parser.parseFromString(block_html,"text/html").firstChild.innerHTML
                document.querySelectorAll("placeholder").forEach((p)=>{
                    p.textContent = placeholder_data[p.getAttribute("var")]
                })*/
                document.open();
                document.write(block_html);
                document.close();
                document.querySelectorAll("placeholder").forEach((p)=>{
                    p.textContent = placeholder_data[p.getAttribute("var")]
                })
                let w8 = 15, w8_el = document.getElementById("clock_p")
                setInterval(()=>{
                    w8 = Math.max(w8-1,0)
                    w8_el.innerText = w8!=0? "Think for "+w8+" more seconds before submitting": "You can now submit"
                },1000)

                document.getElementById("button_submit").addEventListener("click",async(e)=>{
                    e.preventDefault()
                    if((new Date((time_left.submit_stamp+300000) -new Date().valueOf())).valueOf() >= 1000){
                        alert("You are already in freetime!")
                        window.location.href += "" 
                        return
                    }
                    if(w8>0){
                        alert(`Please wait ${w8} more seconds before submiting`)
                        return
                    }
                    let reason = document.getElementById("reason_input").value
                    if(reason.length <= 7){
                        alert("Requires at least 8 characters")
                        return false
                    }

                    
                    let _sync_logs = await chrome.storage.local.get(["adhd_blocker_logs"]);
                    let logs = _sync_logs.adhd_blocker_logs || [];
                    let milis_now = (new Date()).valueOf()

                    logs.push({
                        "reason": reason,
                        "time": milis_now,
                        "domain": window.location.hostname,
                        "other_domains": [window.location.hostname]
                    });
                    await chrome.storage.local.set({
                        "adhd_blocker_logs": logs,
                    });
                    await chrome.storage.local.set({
                        "submit_stamp": milis_now
                    });

                    
                    window.location.href += "" 
                })
            } else {
                let timer_element = `<adhd-block-timer>
    🧩
    <adhd-block-timer-span>
        Timer
    </adhd-block-timer-span>
    <style>
    adhd-block-timer {
        background: #000000c2;
        padding: 15px;
        border: white 1px solid;
        z-index: 2147483647;
        position: fixed; 
        top: 0;
        left: 0;
        border-radius: 2em;
        font-size: 2em;
        color: white;
        pointer-events: none;
    }</style>
</adhd-block-timer>`
                await new Promise(resolve => {
                    if (document.readyState !== "loading") {
                        resolve();
                    } else {
                        document.addEventListener("DOMContentLoaded", resolve, { once: true });
                    }
                });
                
                timer_element = dom_parser.parseFromString(timer_element,"text/html").firstChild.querySelector("adhd-block-timer")
                //console.log(timer_element)
                document.body.appendChild(timer_element)
                let timer_text = timer_element.querySelector("adhd-block-timer-span")
                setInterval(()=>{
                    timer_text.textContent = (new Date((time_left.submit_stamp+300000) -new Date().valueOf())).toTimeString().slice(3,8)
                    if((new Date((time_left.submit_stamp+300000) -new Date().valueOf())).valueOf() <= 1000){
                        window.location.href += "" 
                    }
                },1000)

                
                let _sync_logs = await chrome.storage.local.get(["adhd_blocker_logs"]);
                let logs = _sync_logs.adhd_blocker_logs || [];

                for(let l in logs){
                    if(Math.round(logs[l].time/100) == Math.round(time_left.submit_stamp/100)){
                        console.log(window.location.hostname)
                        if(logs[l].other_domains.findIndex(a=>a==window.location.hostname)<=-1){
                            logs[l].other_domains.push(window.location.hostname)
                            
                            await chrome.storage.local.set({
                                "adhd_blocker_logs": logs,
                            });
                        }
                    }
                }


            }
        }
        
    }

})();
