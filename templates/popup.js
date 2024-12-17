document.addEventListener("DOMContentLoaded", () => {
  const saveAllChatsButton = document.getElementById("save-all-chats");
  const overlay = document.getElementById("overlay");
  const closeOverlayButton = document.getElementById("close-overlay");
  const triggerOverlayButton = document.getElementById("show-overlay");
  const sendButton = document.getElementById("send-prompt");
  const userPrompt = document.getElementById("user-prompt");
  const summarizeButton = document.getElementById("summarize-button");
  const responseDiv = document.querySelector(".formatted-response");
  const clearChatButton = document.getElementById("clear-history");
  const formatOptions = document.querySelectorAll(".dropdown-content a");
  const modal = document.getElementById("custom-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const formatButton = document.getElementById("format-button");
  const formatDropdown = document.getElementById("format-dropdown");
  const dropdownContainer = document.querySelector(".dropdown-container");

  formatButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from closing it immediately
    dropdownContainer.classList.toggle("show");
  });

  // Close dropdown if user clicks outside
  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      dropdownContainer.classList.remove("show");
    }
  });

  function showModal(message) {
    // Update the modal message dynamically
    modal.querySelector("p").textContent = message;
    // Display the modal
    modal.style.display = "flex";
  }

  function hideModal() {
    modal.style.display = "none";
  }

  closeModalBtn.addEventListener("click", hideModal);

  // Example usage:
  // showModal("Please upload a file to summarize.");

  // Select the upload container and the file input
  const uploadContainer = document.querySelector(".upload-container");
  const fileUploadInput = document.getElementById("file-upload");

  // Add drag-and-drop event listeners once
  uploadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadContainer.classList.add("drag-over");
  });

  uploadContainer.addEventListener("dragleave", () => {
    uploadContainer.classList.remove("drag-over");
  });

  uploadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadContainer.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });

  // Variable to store uploaded file content
  let uploadedFileContent = null;

  // A reusable function to handle file reading
  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      uploadedFileContent = event.target.result;
      alert(`File "${file.name}" uploaded successfully!`);
    };
    reader.readAsText(file);
  }

  // Handle file selection via click
  fileUploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  // Load selected format from localStorage
  const savedFormat = localStorage.getItem("selectedFormat");
  if (savedFormat) {
    formatButton.textContent = savedFormat;
  }

  let selectedFormat = savedFormat || "Format"; // Default text for button

  // Function to update button label and save to localStorage
  function updateFormatSelection(format) {
    selectedFormat = format;
    formatButton.textContent = format; // Update button label
    localStorage.setItem("selectedFormat", format); // Persist selection
  }

  // Event listener for format dropdown selection
  formatOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      const chosenFormat = e.target.getAttribute("data-format");
      const formatLabel = e.target.textContent;
      updateFormatSelection(formatLabel);
    });
  });

  // Function to generate the AI prompt based on selected format
  function generatePrompt(format, fileContent) {
    let prompt = "Please format the following data: ";
    switch (format) {
      case "Key Points":
        prompt += "Extract the key points:\n" + fileContent;
        break;
      case "Client Summary":
        prompt += "Summarize this data for a client:\n" + fileContent;
        break;
      case "Bullet List":
        prompt +=
          "Reformat the following data as a bullet list:\n" + fileContent;
        break;
      default:
        prompt += fileContent;
    }
    return prompt;
  }

  // Event listener for Summarize Button
  summarizeButton.addEventListener("click", async () => {
    if (!uploadedFileContent) {
      showModal("Please upload a file to summarize.");
      return;
    }

    if (selectedFormat === "Format") {
      showModal("Please select a format option first.");
      return;
    }

    const prompt = generatePrompt(selectedFormat, uploadedFileContent);

    responseDiv.textContent = "Loading...";
    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      const aiResponse = data.response || "AI failed to return a response.";
      responseDiv.textContent = aiResponse;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      responseDiv.textContent = "Error: Unable to fetch response.";
    }
  });

  // Event listener for Clear Chat Button
  clearChatButton.addEventListener("click", () => {
    localStorage.removeItem("selectedFormat"); // Clear saved format
    formatButton.textContent = "Format"; // Reset button label
    uploadedFileContent = null; // Clear uploaded content
    responseDiv.textContent = ""; // Clear response
  });

  // Format selection dropdown click handler
  formatButton.addEventListener("click", (e) => {
    const formatType = e.target.getAttribute("data-format");
    if (formatType) {
      alert(`Formatting data as: ${formatType}`);
      const formattedResponse = `Formatted output (${formatType}) generated here...`;
      document.querySelector("#response .formatted-response").textContent =
        formattedResponse;
    }
  });

  const showOverlay = () => {
    overlay.style.display = "flex";
  };

  const hideOverlay = () => {
    overlay.style.display = "none";
  };

  // Overlay event listeners
  if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", hideOverlay);
  }

  if (triggerOverlayButton) {
    triggerOverlayButton.addEventListener("click", showOverlay);
  }

  function cleanResponse(response) {
    return response.replace(/\*\*(.*?)\*\*/g, "$1").trim(); // Removes ** surrounding words
  }

  const updateSaveChatsButtonVisibility = () => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      saveAllChatsButton.classList.add("visible");
    } else {
      saveAllChatsButton.classList.remove("visible");
      chatHistoryDiv.style.marginBottom = "0";
    }
  };

  const updateChatHistoryVisibility = () => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      chatHistoryContainer.style.display = "block";
      saveAllChatsButton.classList.add("visible");
    } else {
      chatHistoryContainer.style.display = "none";
      saveAllChatsButton.classList.remove("visible");
    }
  };

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

  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", () => {
    window.close();
  });

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

  function formatAndTruncateResponse(message, truncateParagraphs = 2) {
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

      wrapper.appendChild(fullResponseDiv);
      wrapper.appendChild(showMoreLink);

      showMoreLink.addEventListener("click", () => {
        if (fullResponseDiv.style.display === "none") {
          fullResponseDiv.style.display = "block";
          showMoreLink.textContent = " Show Less...";
        } else {
          fullResponseDiv.style.display = "none";
          showMoreLink.textContent = " Show More...";
        }
      });
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

    const summarizeButton = document.createElement("span");
    summarizeButton.textContent = "Summarize";
    summarizeButton.className = "action-button";
    summarizeButton.style.color = "blue";
    summarizeButton.style.cursor = "pointer";
    summarizeButton.addEventListener("click", () => {
      const summary = summarizeText(fullMessage);
      downloadTextFile("summary.txt", summary);
    });

    actionContainer.appendChild(downloadButton);
    actionContainer.appendChild(document.createTextNode(" | "));
    actionContainer.appendChild(summarizeButton);

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

  function summarizeText(text) {
    const sentences = text.split(". ");
    return sentences.slice(0, 2).join(". ") + "...";
  }

  function getRandomColor() {
    const colors = ["#f7ffeb"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function loadChatHistory() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistoryDiv.innerHTML = "";

    savedChats.forEach((chat) => {
      const chatMessage = document.createElement("div");
      chatMessage.className = "chat-message";
      chatMessage.style.backgroundColor = getRandomColor();

      const userDiv = document.createElement("div");
      userDiv.className = "user";
      userDiv.innerHTML = `<strong>User:</strong> ${chat.user}`;

      const aiDiv = document.createElement("div");
      aiDiv.className = "ai";
      aiDiv.innerHTML = `<strong>AI:</strong>`;
      const formattedContent = formatAndTruncateResponse(chat.ai);
      addActionButtons(formattedContent, chat.ai);
      aiDiv.appendChild(formattedContent);

      const timestampDiv = document.createElement("div");
      timestampDiv.className = "timestamp";
      timestampDiv.textContent = `Sent on: ${formatTimestamp(chat.time)}`;

      chatMessage.appendChild(userDiv);
      chatMessage.appendChild(aiDiv);
      chatMessage.appendChild(timestampDiv);

      chatHistoryDiv.prepend(chatMessage);
    });

    chatHistoryDiv.scrollTop = 0;
    updateSaveChatsButtonVisibility();
    updateChatHistoryVisibility();
  }

  function saveChatHistory(userMessage, aiResponse) {
    const maxChats = 10;
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const timestamp = new Date().toISOString();
    const cleanedResponse = cleanResponse(aiResponse);

    chatHistory.unshift({
      user: userMessage,
      ai: cleanedResponse,
      time: timestamp,
    });

    if (chatHistory.length > maxChats) {
      chatHistory.pop();
    }

    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    updateChatHistoryVisibility();
  }

  const clearChatHistory = () => {
    localStorage.removeItem("chatHistory");
    chatHistoryDiv.innerHTML = "";
    updateChatHistoryVisibility();
  };

  document.getElementById("clear-history").addEventListener("click", () => {
    const confirmClear = confirm(
      "Are you sure you want to clear the chat history?"
    );
    if (confirmClear) {
      clearChatHistory();
    }
  });

  function displayResponse(message) {
    responseDiv.innerHTML = "";
    const formattedContent = formatAndTruncateResponse(message);
    responseDiv.appendChild(formattedContent);
  }

  // Handle sending the user prompt
  sendButton.addEventListener("click", async () => {
    const userMessage = userPrompt.value.trim();

    if (!userMessage) {
      responseDiv.textContent = "Please enter a question.";
      return;
    }

    responseDiv.textContent = "Loading...";

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await response.json();
      const aiResponse = data.response || "No response received.";
      displayResponse(aiResponse);
      saveChatHistory(userMessage, aiResponse);
      loadChatHistory();
    } catch (error) {
      responseDiv.textContent = "Error: Unable to fetch response.";
      console.error("Error fetching response:", error.message);
    }

    userPrompt.value = "";
  });

  // Load chat history on startup
  loadChatHistory();
});
