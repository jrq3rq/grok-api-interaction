document.addEventListener("DOMContentLoaded", () => {
  const saveAllChatsButton = document.getElementById("save-all-chats");
  const overlay = document.getElementById("overlay");
  const closeOverlayButton = document.getElementById("close-overlay");
  const triggerOverlayButton = document.getElementById("show-overlay");

  // Summarize Modal references
  const summarizeModal = document.getElementById("summarize-modal");
  const closeSummarizeModal = document.getElementById("close-summarize-modal");
  const cancelSummarize = document.getElementById("cancel-summarize");
  const submitSummarize = document.getElementById("submit-summarize");
  const dropArea = document.getElementById("drop-area");
  const clearFileButton = document.getElementById("clear-file");

  const sendButton = document.getElementById("send-prompt");
  const userPrompt = document.getElementById("user-prompt");
  const actionDropdown = document.getElementById("action-dropdown");
  const responseDiv = document.querySelector(".formatted-response");
  const fileInput = document.getElementById("summarize-file-upload");
  const uploadIndicator = document.getElementById("upload-indicator");
  const uploadedFilename = document.getElementById("uploaded-filename");

  sendButton.addEventListener("click", async () => {
    const action = actionDropdown.value; // Selected action
    const textInput = userPrompt.value.trim(); // Text input
    const file = fileInput.files[0]; // File input

    // Ensure at least one input method is provided
    if (!textInput && action !== "chat" && !file) {
      alert("Please provide input via text or upload a file.");
      return;
    }

    // Set "Loading..." text in responseDiv
    responseDiv.innerHTML = "<p>Loading...</p>";

    let userInput;
    if (file && action !== "chat") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        userInput = event.target.result;
        await processInput(action, userInput);
      };
      reader.readAsText(file);
    } else {
      userInput = textInput || "No additional input provided.";
      await processInput(action, userInput);
    }
  });

  // Process input based on action
  async function processInput(action, userInput) {
    const prompt = constructPrompt(action, userInput); // Construct prompt based on action
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const aiResponse = data.response || "No response received.";

      // Display the response in the UI
      displayResponse(aiResponse);

      // Save the response to chat history with the action
      saveChatHistory(userInput, aiResponse, action);

      // *** Added line to refresh the displayed chat history ***
      loadChatHistory();
    } catch (error) {
      console.error("Error processing input:", error);
      alert("An error occurred while processing your request.");
    }
  }

  // Display AI response in the UI
  function displayResponse(message) {
    responseDiv.innerHTML = `<p>${message}</p>`;
  }

  // Show uploaded file indicator
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      uploadedFilename.textContent = `Uploaded: ${file.name}`;
      uploadIndicator.classList.remove("hidden");
    }
  });

  // Function to construct dynamic prompts
  function constructPrompt(action, userInput) {
    switch (action) {
      case "chat":
        return `Chat mode: ${userInput}`;
      case "summarize":
        return `Please summarize the following content in the least amount of words possible without leaving out important details:\n\n${userInput}`;
      case "generate-bullet-points":
        return `Please create bullet points for the following content:\n\n${userInput}`;
      case "draft-summary":
        return `Please draft a client summary for the following content:\n\n${userInput}`;
      default:
        throw new Error("Invalid action selected.");
    }
  }

  const showOverlay = () => {
    if (overlay) overlay.style.display = "flex";
  };

  const hideOverlay = () => {
    if (overlay) overlay.style.display = "none";
  };

  if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", hideOverlay);
  }

  if (triggerOverlayButton) {
    triggerOverlayButton.addEventListener("click", showOverlay);
  }

  function cleanResponse(response) {
    return response.replace(/\*\*(.*?)\*\*/g, "$1").trim();
  }

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

  function updateSaveChatsButtonVisibility() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      saveAllChatsButton.classList.add("visible");
    } else {
      saveAllChatsButton.classList.remove("visible");
      chatHistoryDiv.style.marginBottom = "0";
    }
  }

  function updateChatHistoryVisibility() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      chatHistoryContainer.style.display = "block";
      saveAllChatsButton.classList.add("visible");
    } else {
      chatHistoryContainer.style.display = "none";
      saveAllChatsButton.classList.remove("visible");
    }
  }

  function saveAllChats() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length === 0) {
      alert("No chats to save!");
      return;
    }

    let chatContent = "Chat History\n\n";
    savedChats.forEach((chat, index) => {
      chatContent += `Chat ${index + 1}:\n`;
      chatContent += `User: ${chat.user}\n`;
      chatContent += `AI: ${cleanResponse(chat.ai)}\n`;
      chatContent += `Timestamp: ${chat.time}\n\n`;
    });

    const blob = new Blob([chatContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  saveAllChatsButton.addEventListener("click", saveAllChats);
  if (!saveAllChatsButton) {
    console.error("Save All Chats button not found in the DOM.");
    return;
  }
  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", () => {
    window.close();
  });

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleString(undefined, options);
  }

  function formatAndTruncateResponse(message, truncateParagraphs = 1) {
    const cleanedMessage = cleanResponse(message);
    const sections = cleanedMessage
      .split("\n")
      .filter((line) => line.trim() !== ""); // Remove empty lines

    // Wrapper for the formatted response
    const wrapper = document.createElement("div");
    wrapper.className = "formatted-response";

    // Add truncated content
    const truncatedContent = sections.slice(0, truncateParagraphs);
    truncatedContent.forEach((section) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = section;
      wrapper.appendChild(paragraph);
    });

    // Check if truncation is needed
    const isTruncated = sections.length > truncateParagraphs;
    if (isTruncated) {
      const fullResponseDiv = document.createElement("div");
      fullResponseDiv.className = "full-response";
      fullResponseDiv.style.display = "none";

      // Add all sections to the full response div
      sections.forEach((section) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = section.trim();
        fullResponseDiv.appendChild(paragraph);
      });

      // Create the "Show More..." and "Show Less..." toggle link
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

  function addActionButtons(wrapper, fullMessage) {
    const actionContainer = document.createElement("div");
    actionContainer.className = "action-buttons";
    actionContainer.style.textAlign = "center";
    actionContainer.style.marginTop = "10px";
    actionContainer.style.padding = "10px";

    const downloadButton = document.createElement("span");
    downloadButton.textContent = "Download";
    downloadButton.className = "action-button";
    downloadButton.style.color = "blue";
    downloadButton.style.cursor = "pointer";
    downloadButton.addEventListener("click", () => {
      downloadTextFile("chat-response.txt", fullMessage);
    });

    const summarizeBtn = document.createElement("span");
    summarizeBtn.textContent = "Summarize";
    summarizeBtn.className = "action-button";
    summarizeBtn.style.color = "blue";
    summarizeBtn.style.cursor = "pointer";

    actionContainer.appendChild(downloadButton);
    actionContainer.appendChild(document.createTextNode(" | "));
    actionContainer.appendChild(summarizeBtn);

    wrapper.appendChild(actionContainer);
  }

  function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getRandomColor() {
    const colors = ["#f7ffeb"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

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

  function loadChatHistory() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistoryDiv.innerHTML = ""; // Clear previous content

    savedChats.forEach((chat) => {
      const action = chat.action || "chat"; // Default to "chat" if action is missing

      // Create the container for the chat interaction
      const chatMessage = document.createElement("div");
      chatMessage.className = "chat-message";
      chatMessage.style.backgroundColor = getBackgroundColor(action);
      chatMessage.classList.add("chat-message", action || "chat");

      // User input section
      const userDiv = document.createElement("div");
      userDiv.className = "user";
      userDiv.innerHTML = `<strong>User (${action.toUpperCase()}):</strong>`;
      const formattedUserInput = formatAndTruncateResponse(chat.user);
      userDiv.appendChild(formattedUserInput);

      // AI response section
      const aiDiv = document.createElement("div");
      aiDiv.className = "ai";
      aiDiv.innerHTML = `<strong>Legal Enhancer AI:</strong>`;
      const formattedAIResponse = formatAndTruncateResponse(chat.ai);
      aiDiv.appendChild(formattedAIResponse);

      // Timestamp
      const timestampDiv = document.createElement("div");
      timestampDiv.className = "timestamp";
      timestampDiv.textContent = `Sent on: ${formatTimestamp(chat.time)}`;

      // Append all elements to the main container
      chatMessage.appendChild(userDiv);
      chatMessage.appendChild(aiDiv);
      chatMessage.appendChild(timestampDiv);

      // Add the chat interaction to the chat history
      chatHistoryDiv.prepend(chatMessage);
    });

    chatHistoryDiv.scrollTop = 0; // Scroll to the top
    updateSaveChatsButtonVisibility();
  }

  function saveChatHistory(userMessage, aiResponse, action) {
    const maxChats = 10; // Limit to the last 10 messages
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const timestamp = new Date().toISOString();

    // Add the user input and AI response together in one object
    chatHistory.unshift({
      user: userMessage,
      ai: aiResponse,
      action: action,
      time: timestamp,
    });

    // Limit chat history to the maximum number of chats
    if (chatHistory.length > maxChats) {
      chatHistory.pop();
    }

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    updateChatHistoryVisibility();
  }

  document.getElementById("clear-history").addEventListener("click", () => {
    const confirmClear = confirm(
      "Are you sure you want to clear the chat history?"
    );
    if (confirmClear) {
      clearAll();
    }
  });

  function displayResponse(message) {
    responseDiv.innerHTML = "";
    const formattedContent = formatAndTruncateResponse(message);
    responseDiv.appendChild(formattedContent);
  }

  const hideModal = () => summarizeModal.classList.add("hidden");

  closeSummarizeModal.addEventListener("click", hideModal);
  cancelSummarize.addEventListener("click", hideModal);

  // Hide modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === summarizeModal) {
      hideModal();
    }
  });

  // Function to show the upload indicator with the given filename
  function showUploadIndicator(filename) {
    uploadedFilename.textContent = `Uploaded: ${filename}`;
    uploadIndicator.classList.remove("hidden");
    localStorage.setItem("uploadedFileName", filename);
  }

  // Drag-and-Drop events for file upload
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => e.preventDefault(), false);
    dropArea.addEventListener(eventName, (e) => e.stopPropagation(), false);
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
    }
  });

  // Clicking the drop area to open file chooser
  dropArea.addEventListener("click", () => {
    fileInput.click();
  });

  // Handle file selection via the file input
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      showUploadIndicator(file.name);
    }
  });

  // Handle "Submit" button logic for file summary
  submitSummarize.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) {
      alert("Please upload a file to summarize.");
      return;
    }

    // Read the file content
    const reader = new FileReader();
    reader.onload = async function (event) {
      const fileContent = event.target.result;

      // Attach a prompt to the file content
      const summarizePrompt = `Please summarize the following file content in the least amount of words possible without leaving out any important information:\n${fileContent}`;

      // Send request to the AI endpoint
      try {
        const response = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: summarizePrompt }),
        });

        const data = await response.json();
        const aiResponse = data.response || "No response received.";

        // Display the summarized response in the UI
        displayResponse(aiResponse);

        // Save chat to history with the summarize action
        saveChatHistory(
          `Summarize File: ${file.name}`,
          aiResponse,
          "summarize"
        );

        hideModal();
      } catch (error) {
        console.error("Error fetching summary:", error);
        alert("Failed to get a summary from the server.");
      }
    };

    reader.readAsText(file);
  });

  // Clear File Button logic
  clearFileButton.addEventListener("click", () => {
    clearUploadedFile();
  });

  // Clear uploaded file function
  function clearUploadedFile() {
    localStorage.removeItem("uploadedFileName");
    uploadIndicator.classList.add("hidden");
    fileInput.value = ""; // Reset the file input
  }

  function clearAll() {
    // Clear uploaded file
    clearUploadedFile();
    responseDiv.textContent = "";

    // Clear chat history
    localStorage.removeItem("chatHistory");
    chatHistoryDiv.innerHTML = "";
    updateChatHistoryVisibility();
  }

  // On initial load, load chat history
  loadChatHistory();
});
