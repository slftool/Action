const core = require('@actions/core');
const axios = require('axios');
const fs = require('fs');
const {
    exec
} = require("child_process");

var errors = new Array();

try {
    console.log("Starting languagetool server...");
    exec('java -cp languagetool-server.jar org.languagetool.server.HTTPServer --port 8081 --allow-origin "*"', {
        cwd: 'LanguageTool'
    }, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    var data = JSON.parse(fs.readFileSync("data.json"));

    checkSpelling();

} catch (error) {
    core.setFailed(error.message);
}

async function checkSpelling() {

    for (i = 0; i < 26; i++) {
        var letter = data[(i + 10).toString(36)];

        for (n = 0; n < letter.stadt.length; n++) {
            console.log(letter.stadt[n]);
            await sendRequest(letter.stadt[n]);
        }

        for (n = 0; n < letter.land.length; n++) {
            console.log(letter.land[n]);
            await sendRequest(letter.land[n]);
        }

        for (n = 0; n < letter.fluss.length; n++) {
            console.log(letter.fluss[n]);
            await sendRequest(letter.fluss[n]);
        }

        for (n = 0; n < letter.name.length; n++) {
            console.log(letter.name[n]);
            await sendRequest(letter.name[n]);
        }

        for (n = 0; n < letter.beruf.length; n++) {
            console.log(letter.beruf[n]);
            await sendRequest(letter.beruf[n]);
        }

        for (n = 0; n < letter.tier.length; n++) {
            console.log(letter.tier[n]);
            await sendRequest(letter.tier[n]);
        }

        for (n = 0; n < letter.marke.length; n++) {
            console.log(letter.marke[n]);
            await sendRequest(letter.marke[n]);
        }

        for (n = 0; n < letter.pflanze.length; n++) {
            console.log(letter.pflanze[n]);
            await sendRequest(letter.pflanze[n]);
        }

    }

    console.log("---------------------------------------------");
    var errorFile;
    for (i = 0; i < errors.length; i++) {
        for (m = 0; m < errors[i].matches.length; m++) {
            console.log(errors[i].matches[m].message + ": " + errors[i].matches[m].context.text);
            errorFile = errorFile + "\n" + errors[i].matches[m].message + ": " + errors[i].matches[m].context.text;
        }
    }

    fs.writeFileSync("errorlog.txt", errorFile);

    process.exit();
}

async function sendRequest(word) {
    try {
        let res = await axios.get(encodeURI('http://127.0.0.1:8081/v2/check?language=de-DE&altLanguages=en-US&text=' + word));
        let data = res.data;
        if (data.matches.length > 0) {
            errors.push({
                "word": word,
                "matches": data.matches
            });
            for (m = 0; m < data.matches.length; m++) {
                console.log(data.matches[m].message + ": " + data.matches[m].context.text);
            }
        }
    } catch (error) {
        console.error(error);
        core.setFailed(error.message);
    }
}