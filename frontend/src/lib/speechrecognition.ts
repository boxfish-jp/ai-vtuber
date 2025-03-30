export class Recognition {
	private _api: SpeechRecognition;
	private static _instance: Recognition;
	private _onResult: ((event: SpeechRecognitionEvent) => void) | undefined;
	private _onSpeechStart: (() => void) | undefined;
	private _onSpeechEnd: (() => void) | undefined;

	private constructor() {
		const SpeechRecognitionAPI =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		this._api = new SpeechRecognitionAPI();
		this._api.lang = "ja";
		this._api.onresult = (event) => {
			if (this._onResult) {
				this._onResult(event);
			}
		};

		this._api.onspeechstart = () => {
			if (this._onSpeechStart) {
				this._onSpeechStart();
			}
		};

		this._api.onspeechend = () => {
			if (this._onSpeechEnd) {
				this._onSpeechEnd();
			}
		};

		this._api.onend = () => {
			this._api.start();
		};
		this._api.start();
	}

	static instance() {
		if (!Recognition._instance) {
			Recognition._instance = new Recognition();
		}
		return Recognition._instance;
	}

	public setEvent(sendEvent: (eventName: string, content: string) => void) {
		this._onResult = (event) => {
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

		this._onSpeechStart = () => {
			console.log("speechStart");
			sendEvent("speak", "true");
		};

		this._onSpeechEnd = () => {
			console.log("speechEnd");
			sendEvent("speak", "false");
		};

		console.log("call");
		return () => {
			this._onResult = undefined;
			this._onSpeechStart = undefined;
			this._onSpeechEnd = undefined;
		};
	}
}
