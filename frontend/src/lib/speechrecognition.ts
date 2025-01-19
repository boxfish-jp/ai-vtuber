export const speechRecognition = (
	sendEvent: (eventName: string, content: string) => void,
) => {
	const SpeechRecognitionAPI =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	const recognition = new SpeechRecognitionAPI();
	recognition.onresult = (event) => {
		const content = event.results[0][0].transcript;
		console.log(content);
		const unixTime = new Date().getTime();
		const jsonData = JSON.stringify({
			who: "fuguo",
			content: content,
			unixTime,
			point: false,
		});
		sendEvent("chat", jsonData);
	};

	recognition.onspeechstart = () => {
		console.log("speechStart");
		sendEvent("speak", "true");
	};

	recognition.onspeechend = () => {
		console.log("speechEnd");
		sendEvent("speak", "false");
	};

	recognition.onend = () => {
		recognition.start();
	};

	recognition.lang = "ja";

	recognition.start();
	console.log("call");
};
