(async () => {
    let bl_el = document.getElementById("blacklist"),
        wl_el = document.getElementById("whitelist"),
        is_el = document.getElementById("iswhitelist")


    is_el.addEventListener("change", () => {
        bl_el.hidden = is_el.checked
        wl_el.hidden = !is_el.checked
    })


    let savebutton = document.getElementById("save")
    savebutton.addEventListener("click", async () => {
        let bl = bl_el.value.split("\n"),
            wl = wl_el.value.split("\n"),
            is = !is_el.checked

        await chrome.storage.local.set({
            "config": {
                blacklist: bl,
                whitelist: wl,
                isBlacklist: is
            },
        });

    })


    let ___json___ = await chrome.storage.local.get(["config"])
    let data = ___json___.config
    if (data) {
        bl_el.value = data.blacklist.join("\n")
        wl_el.value = data.whitelist.join("\n")
        is_el.checked = !data.isBlacklist


        bl_el.hidden = is_el.checked
        wl_el.hidden = !is_el.checked
    }

})();



(async () => {
    let log = await chrome.storage.local.get(["adhd_blocker_logs"])
    if(!log||!log.adhd_blocker_logs){
        log = { adhd_blocker_logs:[] }
    }

    const table = document.getElementById("log_table");

    //document.getElementById("lazy_log").innerText = JSON.stringify(log.adhd_blocker_logs)

    let table_builder_data = {
        columns: ["Original Domain", "Reason", "Time", "Other Domains"],
        variables: ["domain", "reason", "time", "other_domains"]
    }

    for (let i in log.adhd_blocker_logs) {
        log.adhd_blocker_logs[i].time = new Date(log.adhd_blocker_logs[i].time).toLocaleDateString(navigator.language, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            weekday: "short"
        })
    }

    function table_builder(table, config, data=[]) {

        let thead = document.createElement("thead"),
            tbody = document.createElement("tbody")

        table.appendChild(thead)
        table.appendChild(tbody)

        let head_tr = document.createElement("tr")
        thead.appendChild(head_tr)
        for (let c of config.columns) {
            let th = document.createElement("th")
            th.textContent = c
            head_tr.appendChild(th)
        }
        
        if(!Array.isArray(data)||data.length<=0){
            let tr = document.createElement("tr")
            tbody.appendChild(tr)

            
            for (let i of config.variables) {
                let th = document.createElement("th")
                th.textContent = "No Data Registered!"
                tr.appendChild(th)
            }

            return false
        }

        for (let v of data) {
            let tr = document.createElement("tr")
            tbody.appendChild(tr)

            for (let i of config.variables) {
                let th = document.createElement("th")
                if(Array.isArray(v[i])){
                     th.textContent = v[i].join(", ") || "??"
                } else {
                    th.textContent = !!v[i] ? String(v[i]) : "??"
                }
                tr.appendChild(th)
            }
        }
    }

    table_builder(table, table_builder_data, log.adhd_blocker_logs)

    let rep = document.getElementById("report"),
        report_sufix = "You had $%d0 distractions in the last 30 days$%s1",
        report_table = [
            /*0-4*/ "? Great job! (only valid if you didn't disabled the extension or haven't just installed)",
            /*5-9*/ ", that's okay, great effort, as long you keep focused on what you need to do, it's harmless, we all deserve a bit of comfort!",
            /*10-14*/ ", this means a yellow flag, meaning you get distracted kinda easily...",
            /*15-19*/ ", you must stay a bit alert to control yourself!",
            /*20-24*/ ", you better start controlling yourself more and focus on what you need to do.",
            /*25-29*/ ", this is an red flag!",
            /*30-34*/ ", that's roughly arround 1 distraction per day, take care huh?",
            /*35-39*/ "... Please stop! If this can't help you, please install something that helps",
            /*40-inf*/ "... If this extension is not helping you, it's only bothering you, and you can just remove it. For your own sake."
        ]

    function format_string(_string,contents=[]){
        let st = _string
        for(let c in contents){
            st = st.replaceAll("$%d"+c,Math.round(Number(contents[c])))
            st = st.replaceAll("$%f"+c,Number(contents[c]))
            st = st.replaceAll("$%x"+c,Number(contents[c]).toString(16))
            st = st.replaceAll("$%o"+c,Number(contents[c]).toString(8))
            st = st.replaceAll("$%b"+c,Number(contents[c]).toString(2))
            st = st.replaceAll("$%s"+c,contents[c])
        }
        st = st.replaceAll(/[$][%][dsxofb]\d+/gm,"[??]")
        return st
    }

    let calc_rs = [...log.adhd_blocker_logs]
    calc_rs = calc_rs.filter((v)=>((new Date()).valueOf() - (new Date(v.time)).valueOf() < (60*60*24*1000*30)))

    console.log(calc_rs, [calc_rs.length, report_table[Math.min( Math.round(calc_rs.length/5) ,report_table.length-1)]])
    rep.textContent = format_string(report_sufix,[calc_rs.length,report_table[Math.min( Math.round(calc_rs.length/5) ,report_table.length-1)]])
})()