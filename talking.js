function say(words) {
	//strip out the title
	//(and only do it once, so bold type elsewhere
	//won't get killed)
	toSpeak = words.replace(/<strong>.*?<\/strong><br>/,"");
	//strip out HTML
    toSpeak = toSpeak.replace(/<\/?[a-z]*>/g,"");

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