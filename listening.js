if (game["allow speech to text"]) {
    function lreset() {
        speechSynthesis.cancel();
        console.log("Resetting.");
        document.getElementById("listening").innerHTML = "Start Listening";
        localStorage["transcript"], interim_transcript, final_transcript, document.getElementById("command").value = "";
    }

    function stopit() {
        console.log("stopit");
        working = false;
        speech.stop();
        lreset();
    }

    function action() {
        if (working) {
            console.log("STOPPING");
            working = false;
            speech.stop();
            lreset();
        } else {
            speech.start();
            working = true;
            console.log("STARTING");
            document.getElementById("listening").innerHTML = "Stop Listening";
        }
    }

    function toggleVisibility(selectedTab) {
        var content = document.getElementsByClassName('info');
        for (var i = 0; i < content.length; i++) {
            if (content[i].id == selectedTab) {
                content[i].style.display = 'block';
            } else {
                content[i].style.display = 'none';
            }
        }
    }


    function format(s) {
        return s.replace(/\n/g, '<br>');
    }

    function capitalize(s) {
        return s.replace(/\S/, function(m) {
            return m.toUpperCase();
        });
    }

    function linitialize() {
        speech = new webkitSpeechRecognition();
        interim_transcript = "";
        speech.continuous = true;
        speech.maxAlternatives = 5;
        speech.interimResults = true;
        speech.lang = "en-us";
        //speech.onend = lreset;
        speech.lang = "en-us";
        console.log("Linitializing");
        document.getElementById("command").value = "";
        lreset();
        action();
    }

    var clear, working, speech, final_transcript = "";

// body of execution of this whole thing starts here:
    linitialize();

    if (typeof(localStorage["language"]) == 'undefined') {
        localStorage["language"] = 12;
    }

    if (typeof(localStorage["transcript"]) == 'undefined') {
        localStorage["transcript"] = "";
    }

    document.getElementById("command").value = localStorage["transcript"];
    final_transcript = localStorage["transcript"];

    setInterval(function() {
        var text = document.getElementById("command").value;
        if (text !== localStorage["transcript"]) {
            localStorage["transcript"] = text;
        }
    }, 2000);


    speech.onerror = function(e) {
        var msg = e.error + " error";
        console.log("ERROR");
        if (e.error === 'no-speech') {
            msg = "No speech was detected. Please try again.";
        } else if (e.error === 'audio-capture') {
            msg = "Please ensure that a microphone is connected to your computer.";
        } else if (e.error === 'not-allowed') {
            msg = "The app cannot access your microphone. Please go to chrome://settings/contentExceptions#media-stream and allow Microphone access to this website.";
        }
        error(msg);
    };

    speech.onresult = function(e) {
        var interim_transcript = '';
        if (typeof(e.results) == 'undefined') {
            reset();
            return;
        }
        for (var i = e.resultIndex; i < e.results.length; ++i) {
            var val = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
                final_transcript = val;
                document.getElementById("command").value = final_transcript;
                console.log("command: |" + final_transcript + "|");
                interim_transcript, final_transcript = "";
                document.getElementById("button1").click();
            } else {
                interim_transcript = val;
            }
        }
        document.getElementById("command").value = interim_transcript;

    };
    document.getElementById("listening").addEventListener("click", action);
}