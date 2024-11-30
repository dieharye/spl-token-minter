import axios from "axios";
import axiosAPI from "./axios";
import { JWT } from "./api-key";
import fs from "fs";
import path from "path";

export const getPinataToken = async () => {
  return axiosAPI({
    url: "/v1/pinata/key",
    method: "POST",
    data: {},
  }).then((res) => res.token);
};

export const uploadJSONToPinata = async (jsonData: any) => {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      jsonData,
      {
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const uploadImageToPinata = async (
  imageURL: string
): Promise<string | null> => {
  const imageFile: File | null = await readImageFile(imageURL);
  console.log("🚀 ~ imageFile:", imageFile);

  if (!imageFile) return null;
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    // Optional: Add metadata to the file
    const metadata = JSON.stringify({
      name: "num-token", // Change to your desired file name
      keyvalues: {
        exampleKey: "demo", // Add custom key-value pairs
      },
    });
    formData.append("pinataMetadata", metadata);

    // Optional: Add pinata options
    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`, // Replace with your actual JWT token
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("upload image to pinata => ", data);
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    return null;
  }
};

const readImageFile = async (filePath: string) => {
  // Resolve the absolute path of the image file
  const absolutePath = path.resolve(filePath);

  // Read the file as a Buffer
  const imageBuffer = fs.readFileSync(absolutePath);

  console.log("Image file read as Buffer:", imageBuffer);

  // Optional: Convert Buffer to Base64 string
  const base64Image = imageBuffer.toString("base64");
  console.log("Image file as Base64:", base64Image);

  const blob = new Blob([imageBuffer], {
    type: "image/*",
  });
  const imageFile = new File([blob], "example.png", {
    type: "image/*",
  });
  return imageFile;
};

uploadImageToPinata("assets/img.jpg");
