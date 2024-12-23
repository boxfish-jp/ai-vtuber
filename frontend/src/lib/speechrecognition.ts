const SpeechRecognitionAPI =
	window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognitionAPI();

export const speechRecognition = (
	sendEvent: (eventName: string, content: string) => void,
) => {
	recognition.onresult = (event) => {
		const content = event.results[0][0].transcript;
		console.log(content);
		const unixTime = new Date().getTime();
		const jsonData = JSON.stringify({
			who: "fuguo",
			chatText: content,
			unixTime,
			point: false,
		});
		sendEvent("result", jsonData);
	};

	recognition.onspeechstart = () => {
		console.log("speechStart");
		sendEvent("speak", "true");
	};

	recognition.onspeechend = () => {
		console.log("speechEnd");
		sendEvent("speak", "true");
	};

	recognition.onend = () => {
		speechRecognition(sendEvent);
	};

	recognition.lang = "ja";

	recognition.start();
};
