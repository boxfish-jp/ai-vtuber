const SpeechRecognitionAPI =
	window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognitionAPI();

export const speechRecognition = (
	sendEvent: (eventName: string, content: string) => void,
) => {
	recognition.onresult = (event) => {
		const content = event.results[0][0].transcript;
		console.log(content);
		sendEvent("result", content);
	};

	recognition.onspeechstart = () => {
		console.log("speechStart");
		sendEvent("SPEECH", "START");
	};

	recognition.onspeechend = () => {
		console.log("speechEnd");
		sendEvent("SPEECH", "END");
	};

	recognition.onend = () => {
		speechRecognition(sendEvent);
	};

	recognition.lang = "ja";

	recognition.start();
};
