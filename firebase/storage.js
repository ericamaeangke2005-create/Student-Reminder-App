import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

//
// 📤 UPLOAD FILE
//
export const uploadFile = async (file, folder = "uploads") => {
  try {
    if (!file) throw new Error("No file provided");

    // unique filename para walay conflict
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);

    // upload file
    const snapshot = await uploadBytes(fileRef, file);

    // kuha download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

//
// 🗑️ DELETE FILE
//
export const deleteFile = async (fileURL) => {
  try {
    if (!fileURL) return;

    const fileRef = ref(storage, fileURL);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Delete File Error:", error);
  }
};