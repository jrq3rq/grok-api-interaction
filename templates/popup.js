document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-prompt");
  const userPrompt = document.getElementById("user-prompt");
  const responseDiv = document.getElementById("response");
  const saveAllChatsButton = document.getElementById("save-all-chats");
  const overlay = document.getElementById("overlay");
  const closeOverlayButton = document.getElementById("close-overlay");
  const triggerOverlayButton = document.getElementById("show-overlay");

  // Define these functions FIRST
  const showOverlay = () => {
    overlay.style.display = "flex";
  };

  const hideOverlay = () => {
    overlay.style.display = "none";
  };

  // Event Listener for Overlay Buttons
  if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", hideOverlay);
  }

  if (triggerOverlayButton) {
    triggerOverlayButton.addEventListener("click", showOverlay);
  }

  // Helper function to clean up responses
  function cleanResponse(response) {
    return response.replace(/\*\*(.*?)\*\*/g, "$1").trim(); // Removes ** surrounding words
  }
  // Function to toggle visibility and animation for "Save All Chats" button

  const updateSaveChatsButtonVisibility = () => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const saveAllChatsButton = document.getElementById("save-all-chats");
    const chatHistoryDiv = document.querySelector(".chat-history");

    if (savedChats.length > 0) {
      saveAllChatsButton.classList.add("visible"); // Show button
    } else {
      saveAllChatsButton.classList.remove("visible"); // Hide button
      chatHistoryDiv.style.marginBottom = "0"; // Reset margin
    }
  };

  // Function to update visibility of chat history container
  const updateChatHistoryVisibility = () => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length > 0) {
      chatHistoryContainer.style.display = "block"; // Show chat history container
      saveAllChatsButton.classList.add("visible"); // Show save button
    } else {
      chatHistoryContainer.style.display = "none"; // Hide chat history container
      saveAllChatsButton.classList.remove("visible"); // Hide save button
    }
  };

  // Function to save all chats
  function saveAllChats() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    if (savedChats.length === 0) {
      alert("No chats to save!");
      return;
    }

    // Format chats into a clean text format
    let chatContent = "Chat History\n\n";
    savedChats.forEach((chat, index) => {
      chatContent += `Chat ${index + 1}:\n`;
      chatContent += `User: ${chat.user}\n`;
      chatContent += `AI: ${cleanResponse(chat.ai)}\n`;
      chatContent += `Timestamp: ${chat.time}\n\n`;
    });

    // Download as a .txt file
    const blob = new Blob([chatContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Add event listener to the Save All Chats button
  saveAllChatsButton.addEventListener("click", saveAllChats);

  // Close button functionality
  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", () => {
    window.close(); // Closes the extension popup window
  });

  // Create a container for the chat history
  const chatHistoryContainer = document.createElement("div");
  chatHistoryContainer.className = "chat-history-container";

  // Create the title for the chat history
  const chatHistoryTitle = document.createElement("h2");
  chatHistoryTitle.textContent = "Chat History";
  chatHistoryTitle.className = "chat-history-title";

  // Create the chat history div
  const chatHistoryDiv = document.createElement("div");
  chatHistoryDiv.className = "chat-history";

  // Append the title and chat history to the container
  chatHistoryContainer.appendChild(chatHistoryTitle);
  chatHistoryContainer.appendChild(chatHistoryDiv);

  // Append the chat history container to the body
  document.body.appendChild(chatHistoryContainer);

  // Helper function to clean up responses
  function cleanResponse(response) {
    return response.replace(/\*\*(.*?)\*\*/g, "$1").trim(); // Removes ** surrounding words
  }

  // Helper function to format timestamps
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

  // Function to format and truncate response
  function formatAndTruncateResponse(message, truncateParagraphs = 2) {
    const cleanedMessage = cleanResponse(message);

    // Split the message into paragraphs or list items
    const sections = cleanedMessage
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Create wrapper for the formatted message
    const wrapper = document.createElement("div");
    wrapper.className = "formatted-response";

    // Add truncated content (first N sections)
    const truncatedContent = sections.slice(0, truncateParagraphs);
    truncatedContent.forEach((section) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = section;
      wrapper.appendChild(paragraph);
    });

    // Check if there is more content
    const isTruncated = sections.length > truncateParagraphs;

    // If truncated, add "Show More..." and create full content
    if (isTruncated) {
      const fullResponseDiv = document.createElement("div");
      fullResponseDiv.className = "full-response";
      fullResponseDiv.style.display = "none"; // Hide full content initially

      // Format full content as paragraphs or list items
      sections.forEach((section) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = section.trim();
        fullResponseDiv.appendChild(paragraph);
      });

      // Add "Show More..." link at the very end of the response
      const showMoreLink = document.createElement("span");
      showMoreLink.textContent = " Show More...";
      showMoreLink.className = "show-more-link";
      showMoreLink.style.color = "blue";
      showMoreLink.style.cursor = "pointer";

      // Append "Show More..." to the wrapper
      wrapper.appendChild(fullResponseDiv);
      wrapper.appendChild(showMoreLink);

      // Add event listener to toggle "Show More" and "Show Less"
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

  // Function to add action buttons to a response
  function addActionButtons(wrapper, fullMessage) {
    const actionContainer = document.createElement("div");
    actionContainer.className = "action-buttons";

    // Add padding and center alignment
    actionContainer.style.textAlign = "center";
    actionContainer.style.marginTop = "10px";
    actionContainer.style.padding = "10px";

    // Download Button
    const downloadButton = document.createElement("span");
    downloadButton.textContent = "Download";
    downloadButton.className = "action-button";
    downloadButton.style.color = "blue";
    downloadButton.style.cursor = "pointer";
    downloadButton.addEventListener("click", () => {
      downloadTextFile("chat-response.txt", fullMessage);
    });

    // Summarize Button
    const summarizeButton = document.createElement("span");
    summarizeButton.textContent = "Summarize";
    summarizeButton.className = "action-button";
    summarizeButton.style.color = "blue";
    summarizeButton.style.cursor = "pointer";
    summarizeButton.addEventListener("click", () => {
      const summary = summarizeText(fullMessage);
      downloadTextFile("summary.txt", summary);
    });

    // Placeholder Button for Additional Functionality
    // const placeholderButton = document.createElement("span");
    // placeholderButton.textContent = "Do Something";
    // placeholderButton.className = "action-button";
    // placeholderButton.style.color = "blue";
    // placeholderButton.style.cursor = "pointer";
    // placeholderButton.addEventListener("click", () => {
    //   alert("This button does something useful!");
    // });

    // Append buttons to the action container
    actionContainer.appendChild(downloadButton);
    actionContainer.appendChild(document.createTextNode(" | "));
    actionContainer.appendChild(summarizeButton);
    // actionContainer.appendChild(document.createTextNode(" | "));
    // actionContainer.appendChild(placeholderButton);

    // Append the action container to the wrapper
    wrapper.appendChild(actionContainer);
  }

  // Helper function to download text as a file
  function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Helper function to summarize text
  function summarizeText(text) {
    const sentences = text.split(". ");
    return sentences.slice(0, 2).join(". ") + "..."; // Take the first two sentences
  }

  function getRandomColor() {
    const colors = ["#f7ffeb"]; // Add your desired colors
    // const colors = ["#f9f9f9", "#eaf4fc", "#fffde7", "#f3e5f5"]; // Add your desired colors
    return colors[Math.floor(Math.random() * colors.length)];
  }
  // Load chat history from localStorage

  function loadChatHistory() {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    chatHistoryDiv.innerHTML = ""; // Clear existing chat history

    savedChats.forEach((chat) => {
      const chatMessage = document.createElement("div");
      chatMessage.className = "chat-message";
      chatMessage.style.backgroundColor = getRandomColor(); // Apply random background color

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

      chatHistoryDiv.prepend(chatMessage); // Add newest message at the top
    });

    // Scroll to the top of the chat history
    chatHistoryDiv.scrollTop = 0;
    updateSaveChatsButtonVisibility(); // Update button visibility on load
    updateChatHistoryVisibility(); // Update visibility
  }

  // Save chat history to localStorage
  function saveChatHistory(userMessage, aiResponse) {
    const maxChats = 10; // Define the maximum number of chats to keep
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    // Get the current timestamp
    const timestamp = new Date().toISOString();

    // Clean the AI response before saving
    const cleanedResponse = cleanResponse(aiResponse);

    // Add the new chat to the beginning of the array
    chatHistory.unshift({
      user: userMessage,
      ai: cleanedResponse,
      time: timestamp,
    });

    // Enforce the maximum chat history size
    if (chatHistory.length > maxChats) {
      chatHistory.pop(); // Remove the oldest message from the bottom
    }

    // Save the updated chat history back to localStorage
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    updateChatHistoryVisibility(); // Update visibility
  }

  // Function to clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem("chatHistory"); // Clear from localStorage
    chatHistoryDiv.innerHTML = ""; // Clear the UI
    updateChatHistoryVisibility(); // Update visibility
  };

  // Event listener for the "Clear Chat" button
  document.getElementById("clear-history").addEventListener("click", () => {
    const confirmClear = confirm(
      "Are you sure you want to clear the chat history?"
    );
    if (confirmClear) {
      clearChatHistory();
    }
  });

  // Function to handle AI responses
  function displayResponse(message) {
    responseDiv.innerHTML = ""; // Clear previous response content
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
