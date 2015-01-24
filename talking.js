function say(words) {
    toSpeak = words.replace(/<\/?[a-z]*>/g,""); //strip out HTML
    console.log("SPEAKING: " + toSpeak);
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(toSpeak));
}

function shutup() {
	speechSynthesis.cancel();
}

document.getElementById("talking").addEventListener("click", shutup);