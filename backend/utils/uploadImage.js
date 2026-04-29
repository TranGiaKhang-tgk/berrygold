import axios from "axios";
import FormData from "form-data";

export const uploadImageToFreeImage = async (fileBuffer, fileName) => {
  try {
    const form = new FormData();
    form.append("source", fileBuffer, { filename: fileName });
    form.append("action", "upload");

    // Thay API key trực tiếp
    const apiKey = "6d207e02198a847aa98d0a2a901485a5";

    const res = await axios.post(
      `https://freeimage.host/api/1/upload?key=${apiKey}`,
      form,
      { headers: form.getHeaders() }
    );

    if (res.data?.image?.display_url) {
      console.log("Image uploaded successfully:", res.data.image.display_url);
      return res.data.image.display_url;
    }

    throw new Error("Upload failed");
  } catch (err) {
    console.error("Error uploading image:", err);
    throw err;
  }
};
