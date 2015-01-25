function say(words) {
    toSpeak = words.replace(/<\/?[a-z]*>/g,""); //strip out HTML

    //this is where we should break up "toSpeak" into chunks,
    // to prevent the end of messages from getting chopped off.
    console.log("SPEAKING: " + toSpeak);
    utterance = new SpeechSynthesisUtterance(toSpeak);
	utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
}

function shutup() {
	speechSynthesis.cancel();
}

document.getElementById("talking").addEventListener("click", shutup);