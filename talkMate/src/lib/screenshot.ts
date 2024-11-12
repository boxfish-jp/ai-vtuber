import dotenv from "dotenv";
import screenshot from "screenshot-desktop";
import sharp from "sharp";
dotenv.config();

export const takeScreenshot = async (): Promise<string> => {
	const imageBuffer = await getScreenshot();
	const url = await saveImage(imageBuffer);
	return url;
};

const getScreenshot = async (): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		screenshot({ format: "png" })
			.then((image) => {
				sharp(image)
					.resize(480)
					.toBuffer((err, data) => {
						if (err) {
							reject(err);
						}
						resolve(data);
					});
			})
			.catch((error) => {
				reject(error);
			});
	});
};

const saveImage = async (buffer: Buffer): Promise<string> => {
	const formData = new FormData();
	const decode = new File([buffer], "image.png");

	formData.append("upload", decode);

	const endpoint = process.env.API_ENDPOINT;
	if (!endpoint) {
		throw new Error("API_ENDPOINT is not defined");
	}
	const res = await fetch(`${endpoint}/image`, {
		method: "POST",
		body: formData,
	});
	if (res.ok) {
		const filename = await res.text();
		return `${endpoint}/image/${filename}`;
	}
	throw new Error("Failed to upload image");
};
