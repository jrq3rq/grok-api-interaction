document.addEventListener("DOMContentLoaded", () => {
  /********************************************************
   * ============  Utility Functions  ======================
   ********************************************************/

  // Generate a unique ID
  function generateUniqueId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Remove the first sentence from a text
  function removeFirstSentence(text) {
    const sentenceEndRegex = /([.?!])\s+(?=[A-Z])/;
    const match = sentenceEndRegex.exec(text);
    if (match) {
      const index = match.index + match[0].length;
      return text.substring(index).trim();
    }
    return text;
  }

  // Remove AI label if present
  function removeAILabel(response) {
    const prefix = "Legal Enhancer AI:";
    if (response.startsWith(prefix)) {
      return response.substring(prefix.length).trim();
    }
    return response;
  }

  // Construct dynamic prompts based on action
  function constructPrompt(action, userInput) {
    switch (action) {
      case "chat":
        return `Chat mode: ${userInput}`;
      case "summarize":
        return `Summarize the following content in the least amount of words possible without leaving out the most important parts:\n\n${userInput}`;
      case "generate-bullet-points":
        return `Convert the following content into bullet points:\n\n${userInput}`;
      case "draft-summary":
        return `Draft a detailed summary for the following content:\n\n${userInput}`;
      default:
        throw new Error("Invalid action selected.");
    }
  }

  // Clean response by removing markdown or specific labels
  function cleanResponse(response) {
    return response.replace(/\*\*(.*?)\*\*/g, "$1").trim();
  }

  // Format and truncate responses for display
  function formatAndTruncateResponse(message, truncateParagraphs = 1) {
    const cleanedMessage = cleanResponse(message);
    const sections = cleanedMessage
      .split("\n")
      .filter((line) => line.trim() !== "");

    const wrapper = document.createElement("div");
    wrapper.className = "formatted-response";

    const truncatedContent = sections.slice(0, truncateParagraphs);
    truncatedContent.forEach((section) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = section;
      wrapper.appendChild(paragraph);
    });

    const isTruncated = sections.length > truncateParagraphs;
    if (isTruncated) {
      const fullResponseDiv = document.createElement("div");
      fullResponseDiv.className = "full-response";
      fullResponseDiv.style.display = "none";

      sections.forEach((section) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = section.trim();
        fullResponseDiv.appendChild(paragraph);
      });

      const showMoreLink = document.createElement("span");
      showMoreLink.textContent = " Show More...";
      showMoreLink.className = "show-more-link";
      showMoreLink.style.color = "blue";
      showMoreLink.style.cursor = "pointer";

      showMoreLink.addEventListener("click", () => {
        if (fullResponseDiv.style.display === "none") {
          fullResponseDiv.style.display = "block";
          showMoreLink.textContent = " Show Less...";
        } else {
          fullResponseDiv.style.display = "none";
          showMoreLink.textContent = " Show More...";
        }
      });

      wrapper.appendChild(fullResponseDiv);
      wrapper.appendChild(showMoreLink);
    }

    return wrapper;
  }

  // Display AI response in the UI
  function displayResponse(message) {
    const responseDiv = document.querySelector(".formatted-response");
    responseDiv.innerHTML = "";
    const formattedContent = formatAndTruncateResponse(message);
    responseDiv.appendChild(formattedContent);
  }

  // Format timestamps for display
  function formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid timestamp");
      }
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return date.toLocaleString(undefined, options);
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid Date";
    }
  }

  // Get background color based on action type
  function getBackgroundColor(action) {
    switch (action) {
      case "chat":
        return "#f7ffeb"; // Light green
      case "summarize":
        return "#e7f4ff"; // Light blue
      case "generate-bullet-points":
        return "#f3e7ff"; // Light purple
      case "draft-summary":
        return "#fffbe7"; // Light yellow
      default:
        return "#f7ffeb"; // Default light green
    }
  }

  // Download text file utility
  function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Utility function to read a file as text
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  // OCR Utility with Tesseract.js
  async function performOCR(file) {
    try {
      const responseDiv = document.querySelector(".formatted-response");
      responseDiv.innerHTML = "<p>Performing OCR on the image...</p>";

      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          console.log("Tesseract Log:", m);
          if (m.status === "recognizing text") {
            responseDiv.innerHTML = `<p>Performing OCR: ${Math.round(
              m.progress * 100
            )}%</p>`;
          }
        },
      });
      return text || "";
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to extract text from the image.");
      document.querySelector(".formatted-response").innerHTML = "";
      return null;
    }
  }

  /********************************************************
   * ============  Element References  ======================
   ********************************************************/
  const saveAllChatsButton = document.getElementById("save-all-chats");
  const overlay = document.getElementById("overlay");
  const closeOverlayButton = document.getElementById("close-overlay");
  const triggerOverlayButton = document.getElementById("show-overlay");
  const dropArea = document.getElementById("drop-area");
  const clearFileButton = document.getElementById("clear-file");
  const sendButton = document.getElementById("send-prompt");
  const userPrompt = document.getElementById("user-prompt");
  const actionDropdown = document.getElementById("action-dropdown");
  const responseDiv = document.querySelector(".formatted-response");
  const fileInput = document.getElementById("summarize-file-upload");
  const uploadIndicator = document.getElementById("upload-indicator");
  const uploadedFilename = document.getElementById("uploaded-filename");
  const clearHistoryButton = document.getElementById("clear-history");
  const closeButton = document.getElementById("close-button");

  /********************************************************
   * ==========  Overlay Show/Hide Handlers  ================
   ********************************************************/
  function showOverlay() {
    overlay.style.display = "flex";
  }
  function hideOverlay() {
    overlay.style.display = "none";
  }

  closeOverlayButton?.addEventListener("click", hideOverlay);
  triggerOverlayButton?.addEventListener("click", showOverlay);

  /********************************************************
   * ==========  Chat History Container Setup  ============
   ********************************************************/
  const chatHistoryContainer = document.createElement("div");
  chatHistoryContainer.className = "chat-history-container";

  const chatHistoryTitle = document.createElement("h2");
  chatHistoryTitle.textContent = "Chat History";
  chatHistoryTitle.className = "chat-history-title";

  const chatHistoryDiv = document.createElement("div");
  chatHistoryDiv.className = "chat-history";

  chatHistoryContainer.appendChild(chatHistoryTitle);
  chatHistoryContainer.appendChild(chatHistoryDiv);
  document.body.appendChild(chatHistoryContainer);

  /********************************************************
   * ===============  Chat History Updates  ===============
   ********************************************************/
  function updateChatHistoryVisibility() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      chatHistoryContainer.style.display = "block";
      saveAllChatsButton?.classList.add("visible");
    } else {
      chatHistoryContainer.style.display = "none";
      saveAllChatsButton?.classList.remove("visible");
    }
  }

  function updateSaveChatsButtonVisibility() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      saveAllChatsButton?.classList.add("visible");
    } else {
      saveAllChatsButton?.classList.remove("visible");
      chatHistoryDiv.style.marginBottom = "0";
    }
  }

  /********************************************************
   * ===============  Save All Chats Function  ============
   ********************************************************/
  function saveAllChats() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length === 0) {
      alert("No chats to save!");
      return;
    }

    let chatContent = "Chat History\n\n";
    savedChats.forEach((chat, index) => {
      console.log(`Chat ${index + 1} User:`, chat.user);
      console.log(`Chat ${index + 1} AI:`, chat.ai);
      chatContent += `Chat ${index + 1}:\n`;

      const cleanedUserInput = removeFirstSentence(chat.user);
      chatContent += `User: ${cleanedUserInput}\n`;

      const cleanedAIResponse = removeFirstSentence(chat.ai);
      chatContent += `AI: ${cleanedAIResponse}\n`;

      chatContent += `Timestamp: ${chat.time}\n\n`;
    });

    downloadTextFile("chat-history.txt", chatContent);
  }

  saveAllChatsButton?.addEventListener("click", saveAllChats);

  /********************************************************
   * ==========  Close Button Handler  =====================
   ********************************************************/
  closeButton?.addEventListener("click", () => {
    window.close();
  });

  /********************************************************
   * ===============  Download Chat Function  ==============
   ********************************************************/
  function downloadChat(chat) {
    const action = chat.action || "chat";
    const chatContent = `Chat (${action.toUpperCase()}):\n\nUser:\n${
      chat.user
    }\n\nAI:\n${chat.ai}\n\nTimestamp: ${chat.time}`;
    downloadTextFile(`chat-${formatTimestamp(chat.time)}.txt`, chatContent);
  }

  /********************************************************
   * ============  Delete Specific Chat Function ============
   ********************************************************/
  function deleteChat(chatId) {
    let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    chatHistory = chatHistory.filter((chat) => chat.id !== chatId);

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    loadChatHistory();
    alert("Chat deleted successfully.");
  }

  /********************************************************
   * =============  Save Chat History Function  ============
   ********************************************************/
  function saveChatHistory(userMessage, aiResponse, action) {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const timestamp = new Date().toISOString();

    const cleanedUserMessage = userMessage.trim();
    const cleanedAIResponse = removeFirstSentence(aiResponse).trim();

    const finalUserMessage = removeAILabel(cleanedUserMessage);
    const finalAIResponse = removeAILabel(cleanedAIResponse);

    const chatHash = btoa(`${finalUserMessage}_${finalAIResponse}_${action}`);

    const isDuplicate = chatHistory.some((chat) => chat.hash === chatHash);
    if (isDuplicate) {
      console.warn("Duplicate chat detected. Not saving.");
      return;
    }

    const newChat = {
      id: generateUniqueId(),
      user: finalUserMessage,
      ai: finalAIResponse,
      action: action,
      time: timestamp,
      hash: chatHash,
    };

    chatHistory.unshift(newChat);

    const maxChats = 10;
    if (chatHistory.length > maxChats) {
      chatHistory.pop();
    }

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    console.log("Chat history saved successfully:", chatHistory);
    updateChatHistoryVisibility();
  }

  /********************************************************
   * ============  File Upload Event Listeners  ===========
   ********************************************************/
  function showUploadIndicator(filename) {
    uploadedFilename.textContent = `Uploaded: ${filename}`;
    uploadIndicator.classList.remove("hidden");
    localStorage.setItem("uploadedFileName", filename);
  }

  function clearUploadedFile() {
    localStorage.removeItem("uploadedFileName");
    uploadIndicator.classList.add("hidden");
    fileInput.value = "";
    userPrompt.disabled = false;
  }

  function handleFileUpload(file) {
    const action = actionDropdown.value;
    if (action !== "chat" && file) {
      userPrompt.value = "";
      userPrompt.disabled = true;
    }
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  dropArea.addEventListener("dragover", () => {
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (e) => {
    dropArea.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      showUploadIndicator(files[0].name);
      handleFileUpload(files[0]);
    }
  });

  dropArea.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      showUploadIndicator(file.name);
      handleFileUpload(file);
    }
  });

  clearFileButton.addEventListener("click", clearUploadedFile);

  /********************************************************
   * ============  Send Button / Process Input  ===========
   ********************************************************/
  async function processInput(action, userInput) {
    const prompt = constructPrompt(action, userInput);
    console.log("Constructed Prompt:", prompt);
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      let aiResponse = data.response || "No response received.";
      console.log("Raw AI Response:", aiResponse);

      // Check if the response starts with the prompt and remove it if so
      if (aiResponse.startsWith(prompt)) {
        aiResponse = aiResponse.substring(prompt.length).trim();
        console.log("Cleaned AI Response:", aiResponse);
      }

      // Decide if removing the first sentence is beneficial for this response
      // If not beneficial, comment out or remove this line
      const finalAIResponse = removeFirstSentence(aiResponse);
      console.log(
        "Final AI Response after removing first sentence:",
        finalAIResponse
      );

      displayResponse(finalAIResponse);

      saveChatHistory(userInput, finalAIResponse, action);

      loadChatHistory();
    } catch (error) {
      console.error("Error processing input:", error);
      alert("An error occurred while processing your request.");
    }
  }

  sendButton.addEventListener("click", async () => {
    const action = actionDropdown.value;
    const textInput = userPrompt.value.trim();
    const file = fileInput.files[0];

    // Basic validation: if no input for non-chat + no file, abort
    if (!textInput && action !== "chat" && !file) {
      alert("Please provide input via text or upload a file.");
      return;
    }

    // Show a loading message
    responseDiv.innerHTML = "<p>Loading...</p>";

    let userInput = textInput || "No additional input provided.";

    if (file) {
      // ====== CASE 1: We have a FILE ======
      // Keep your same logic for reading the file or OCR
      if (/^image\//i.test(file.type)) {
        const extractedText = await performOCR(file);
        if (!extractedText) {
          alert("Failed to extract text from the image.");
          return;
        }
        userInput = extractedText;
      } else {
        try {
          userInput = await readFileAsText(file);
        } catch (error) {
          console.error("Error reading file:", error);
          userInput = `File uploaded: ${file.name}`;
        }
      }

      // Now we do the FormData fetch
      // (This is the code you already have in place)
      const formData = new FormData();
      formData.append("prompt", userInput);
      formData.append("action", action);
      // optionally pass action so server knows how to handle
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:3000/chat", {
          method: "POST",
          body: formData, // No headers
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        // Keep your removal of the first sentence if you want
        const finalAIResponse = removeFirstSentence(data.response);
        displayResponse(finalAIResponse);
        saveChatHistory(userInput, finalAIResponse, action);
        loadChatHistory();
      } catch (error) {
        console.error("Error processing input:", error);
        alert("An error occurred while processing your request (file).");
      }
    } else {
      // ====== CASE 2: No file => Use the JSON approach via processInput ======
      // This ensures the prompt is constructed by your "constructPrompt" function
      try {
        await processInput(action, userInput);
        // that will handle the fetch, display, etc.
      } catch (error) {
        console.error("Error processing input:", error);
        alert("An error occurred while processing your request (no file).");
      }
    }
  });

  /********************************************************
   * ============  Load and Display Chat History  ===========
   ********************************************************/
  function loadChatHistory() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    console.log("Loading chat history:", savedChats);
    chatHistoryDiv.innerHTML = "";

    savedChats.forEach((chat) => {
      const action = chat.action || "chat";
      const chatMessage = document.createElement("div");
      chatMessage.className = "chat-message";
      const messageColor = getBackgroundColor(action);
      chatMessage.style.backgroundColor = messageColor;
      chatMessage.classList.add("chat-message", action || "chat");

      const userDiv = document.createElement("div");
      userDiv.className = "user";
      userDiv.innerHTML = `<strong>User (${action.toUpperCase()}):</strong>`;

      const formattedUserInput = formatAndTruncateResponse(chat.user);
      userDiv.appendChild(formattedUserInput);

      const aiDiv = document.createElement("div");
      aiDiv.className = "ai";
      aiDiv.innerHTML = `<strong>Legal Enhancer AI:</strong>`;

      const formattedAIResponse = formatAndTruncateResponse(chat.ai);
      aiDiv.appendChild(formattedAIResponse);

      const timestampDiv = document.createElement("div");
      timestampDiv.className = "timestamp";
      timestampDiv.textContent = `Sent on: ${formatTimestamp(chat.time)}`;
      timestampDiv.style.color = "#9d9d9d";

      const downloadButton = document.createElement("button");
      downloadButton.className = "download-chat";
      downloadButton.textContent = "Download Chat";
      downloadButton.style.marginTop = "10px";
      downloadButton.style.backgroundColor = messageColor;
      downloadButton.style.border = "1px solid #0000001a";
      downloadButton.style.color = "#333";
      downloadButton.style.padding = "10px";
      downloadButton.style.borderRadius = "5px";
      downloadButton.style.fontSize = "10px";
      downloadButton.style.textTransform = "uppercase";
      downloadButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
      downloadButton.style.cursor = "pointer";
      downloadButton.addEventListener("click", () => downloadChat(chat));

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-chat";
      deleteButton.textContent = "Delete Chat";
      deleteButton.style.marginTop = "10px";
      deleteButton.style.backgroundColor = messageColor;
      deleteButton.style.border = "1px solid #0000001a";
      deleteButton.style.color = "#333";
      deleteButton.style.padding = "10px";
      deleteButton.style.borderRadius = "5px";
      deleteButton.style.fontSize = "10px";
      deleteButton.style.textTransform = "uppercase";
      deleteButton.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.marginLeft = "10px";
      deleteButton.setAttribute("data-chat-id", chat.id);
      deleteButton.addEventListener("click", (event) => {
        const chatId = event.target.getAttribute("data-chat-id");
        const confirmDelete = confirm(
          "Are you sure you want to delete this chat?"
        );
        if (confirmDelete) {
          deleteChat(chatId);
        }
      });

      const buttonsContainer = document.createElement("div");
      buttonsContainer.style.display = "flex";
      buttonsContainer.style.justifyContent = "flex-start";
      buttonsContainer.style.alignItems = "center";
      buttonsContainer.style.marginTop = "10px";
      buttonsContainer.appendChild(downloadButton);
      buttonsContainer.appendChild(deleteButton);

      chatMessage.appendChild(userDiv);
      chatMessage.appendChild(aiDiv);
      chatMessage.appendChild(timestampDiv);
      chatMessage.appendChild(buttonsContainer);

      chatHistoryDiv.prepend(chatMessage);
    });

    chatHistoryDiv.scrollTop = 0;
    updateSaveChatsButtonVisibility();
  }

  /********************************************************
   * ============  Clear Chats / Overlay Buttons  ==========
   ********************************************************/
  function clearAll() {
    clearUploadedFile();
    responseDiv.textContent = "";
    localStorage.removeItem("chatHistory");
    chatHistoryDiv.innerHTML = "";
    updateChatHistoryVisibility();
  }

  clearHistoryButton?.addEventListener("click", () => {
    const confirmClear = confirm(
      "Are you sure you want to clear the chat history?"
    );
    if (confirmClear) {
      clearAll();
    }
  });

  loadChatHistory();
});
