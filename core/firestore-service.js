// core/firestore-service.js

import { db } from "./firebase-config.js"; // Ensure the path and extension are correct
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

/**
 * Save a single chat to Firestore.
 * @param {string} clientId - The ID of the client
 * @param {object} chat - The chat object to save (id, user, ai, action, time, hash, etc.)
 * @returns {Promise<void>}
 */
export const saveChatToFirestore = async (clientId, chat) => {
  try {
    const chatCollection = collection(db, `clients/${clientId}/chatHistories`);
    await addDoc(chatCollection, chat);
    console.log(`Chat ${chat.id} saved to Firestore.`);
  } catch (error) {
    console.error("Error saving chat to Firestore:", error);
    throw error;
  }
};

/**
 * Save all chats from local storage to Firestore.
 * @param {string} clientId - The ID of the client
 * @returns {Promise<void>}
 */
export const saveAllChatsToFirestore = async (clientId) => {
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

  if (chatHistory.length === 0) {
    alert("No chats available to save.");
    return;
  }

  try {
    for (const chat of chatHistory) {
      // For simplicity, we're not checking for duplicates here.
      // If needed, you could match by 'id' or 'hash' to avoid duplicates.
      await saveChatToFirestore(clientId, chat);
    }
    alert("All chats have been successfully saved to Firestore.");
  } catch (error) {
    console.error("An error occurred while saving chats to Firestore:", error);
    alert("An error occurred while saving chats to Firestore.");
  }
};

/**
 * Fetch all chat histories for a client from Firestore.
 * @param {string} clientId - The ID of the client
 * @returns {Promise<object[]>} - Returns an array of chat objects
 */
export const fetchChatsFromFirestore = async (clientId) => {
  try {
    const chatCollection = collection(db, `clients/${clientId}/chatHistories`);
    // Order by time descending
    const q = query(chatCollection, orderBy("time", "desc"));
    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return chats;
  } catch (error) {
    console.error("Error fetching chats from Firestore:", error);
    throw error;
  }
};
