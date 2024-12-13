// // DOM Elements
// const sendButton = document.getElementById("send-prompt");
// const userPrompt = document.getElementById("user-prompt");
// const responseDiv = document.getElementById("response");
// const chatHistoryDiv = document.createElement("div");
// chatHistoryDiv.className = "chat-history";
// document.body.appendChild(chatHistoryDiv);

// // Load chat history from localStorage
// function loadChatHistory() {
//   const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
//   chatHistoryDiv.innerHTML = ""; // Clear existing chat history

//   // Add the newest chats at the top of the chat history
//   savedChats.forEach((chat) => {
//     const chatMessage = document.createElement("div");
//     chatMessage.className = "chat-message";
//     chatMessage.innerHTML = `
//       <div class="user"><strong>User:</strong> ${chat.user}</div>
//       <div class="ai"><strong>AI:</strong> ${chat.ai}</div>
//     `;
//     chatHistoryDiv.prepend(chatMessage); // Add the new message to the top
//   });
// }

// // Save chat history to localStorage
// function saveChatHistory(userMessage, aiResponse) {
//   const maxChats = 4; // Define the maximum number of chats to keep
//   const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

//   // Add the new chat to the beginning of the array
//   chatHistory.unshift({ user: userMessage, ai: aiResponse });

//   // Enforce the maximum chat history size
//   if (chatHistory.length > maxChats) {
//     chatHistory.pop(); // Remove the oldest message from the bottom
//   }

//   // Save the updated chat history back to localStorage
//   localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
// }

// // Function to clear chat history
// function clearChatHistory() {
//   localStorage.removeItem("chatHistory"); // Clear from localStorage
//   chatHistoryDiv.innerHTML = ""; // Clear from the UI
// }

// // Event listener for the "Clear Chat" button
// document.getElementById("clear-history").addEventListener("click", () => {
//   const confirmClear = confirm(
//     "Are you sure you want to clear the chat history?"
//   );
//   if (confirmClear) {
//     clearChatHistory();
//   }
// });

// // Function to handle AI responses
// function displayResponse(message) {
//   responseDiv.innerHTML = ""; // Clear previous response content

//   // Create a wrapper for the message
//   const messageWrapper = document.createElement("div");
//   messageWrapper.className = "message-wrapper";
//   messageWrapper.textContent = message;

//   // Limit initial height but allow scrolling if needed
//   messageWrapper.style.maxHeight = "150px"; // Set initial max height
//   messageWrapper.style.overflowY = "hidden"; // Hide overflow content
//   messageWrapper.style.transition = "max-height 0.3s ease";

//   // Add the wrapper to the response container
//   responseDiv.appendChild(messageWrapper);

//   // Check if the message exceeds a certain number of characters or lines
//   const maxLength = 250; // Approximate length to determine truncation
//   if (message.length > maxLength) {
//     // Create the "Show more" button
//     const toggleButton = document.createElement("button");
//     toggleButton.className = "show-more-button";
//     toggleButton.textContent = "Show more";

//     // Add the toggle button to the response container
//     responseDiv.appendChild(toggleButton);

//     // Add event listener to toggle expanded/collapsed state
//     toggleButton.addEventListener("click", () => {
//       if (messageWrapper.style.maxHeight === "150px") {
//         messageWrapper.style.maxHeight = "none"; // Expand to full height
//         messageWrapper.style.overflowY = "auto"; // Allow scrolling
//         toggleButton.textContent = "Show less";
//       } else {
//         messageWrapper.style.maxHeight = "150px"; // Collapse back
//         messageWrapper.style.overflowY = "hidden"; // Hide overflow
//         toggleButton.textContent = "Show more";
//       }
//     });
//   }
// }

// // Close button event listener
// document.getElementById("close-button").addEventListener("click", () => {
//   window.close(); // Closes the extension window when "X" is clicked
// });

// // Handle sending the user prompt
// sendButton.addEventListener("click", async () => {
//   const userMessage = userPrompt.value.trim();

//   if (!userMessage) {
//     responseDiv.textContent = "Please enter a question.";
//     return;
//   }

//   responseDiv.textContent = "Loading...";

//   try {
//     const response = await fetch("http://localhost:3000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ prompt: userMessage }),
//     });

//     const data = await response.json();
//     const aiResponse = data.response || "No response received.";
//     displayResponse(aiResponse);
//     saveChatHistory(userMessage, aiResponse);
//     loadChatHistory();
//   } catch (error) {
//     responseDiv.textContent = "Error: Unable to fetch response.";
//     console.error("Error fetching response:", error.message);
//   }

//   userPrompt.value = "";
// });

// // Load chat history on startup
// loadChatHistory();
// // DOM Elements
// DOM Elements
const sendButton = document.getElementById("send-prompt");
const userPrompt = document.getElementById("user-prompt");
const responseDiv = document.getElementById("response");
const chatHistoryDiv = document.createElement("div");
chatHistoryDiv.className = "chat-history";
document.body.appendChild(chatHistoryDiv);

// Helper function to clean up responses (removes '**' and other unnecessary characters)
function cleanResponse(response) {
  return response.replace(/\*\*(.*?)\*\*/g, "$1"); // Removes ** surrounding words
}

// Load chat history from localStorage
function loadChatHistory() {
  const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistoryDiv.innerHTML = ""; // Clear existing chat history

  // Add the newest chats at the top of the chat history
  savedChats.forEach((chat) => {
    const chatMessage = document.createElement("div");
    chatMessage.className = "chat-message";
    chatMessage.innerHTML = `
      <div class="user"><strong>User:</strong> ${chat.user}</div>
      <div class="ai"><strong>AI:</strong> ${cleanResponse(chat.ai)}</div>
    `;
    chatHistoryDiv.prepend(chatMessage); // Add the new message to the top
  });
}

// Save chat history to localStorage
function saveChatHistory(userMessage, aiResponse) {
  const maxChats = 4; // Define the maximum number of chats to keep
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

  // Clean the AI response before saving
  const cleanedResponse = cleanResponse(aiResponse);

  // Add the new chat to the beginning of the array
  chatHistory.unshift({ user: userMessage, ai: cleanedResponse });

  // Enforce the maximum chat history size
  if (chatHistory.length > maxChats) {
    chatHistory.pop(); // Remove the oldest message from the bottom
  }

  // Save the updated chat history back to localStorage
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Function to clear chat history
function clearChatHistory() {
  localStorage.removeItem("chatHistory"); // Clear from localStorage
  chatHistoryDiv.innerHTML = ""; // Clear from the UI
}

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

  // Clean the response to remove unnecessary formatting
  const cleanedMessage = cleanResponse(message);

  // Create a wrapper for the message
  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-wrapper";

  // Split the cleaned message into paragraphs or lists
  const lines = cleanedMessage.split("\n");
  lines.forEach((line) => {
    if (/^\d+\.\s/.test(line)) {
      // If the line is a numbered list (e.g., "1. Example"), format as a list item
      const listItem = document.createElement("div");
      listItem.className = "list-item";
      listItem.textContent = line;
      listItem.style.marginLeft = "20px"; // Minimal indentation for list items
      listItem.style.marginBottom = "5px"; // Add space between list items
      messageWrapper.appendChild(listItem);
    } else if (line.trim() !== "") {
      // For paragraphs, add them as separate lines
      const paragraph = document.createElement("p");
      paragraph.textContent = line.trim();
      paragraph.style.marginBottom = "10px"; // Add space between paragraphs
      messageWrapper.appendChild(paragraph);
    }
  });

  // Limit initial height but allow scrolling if needed
  messageWrapper.style.maxHeight = "150px"; // Set initial max height
  messageWrapper.style.overflowY = "hidden"; // Hide overflow content
  messageWrapper.style.transition = "max-height 0.3s ease";

  // Add the wrapper to the response container
  responseDiv.appendChild(messageWrapper);

  // Check if the message exceeds a certain number of characters or lines
  const maxLength = 250; // Approximate length to determine truncation
  if (cleanedMessage.length > maxLength) {
    // Create the "Show more" button
    const toggleButton = document.createElement("button");
    toggleButton.className = "show-more-button";
    toggleButton.textContent = "Show more";

    // Add the toggle button to the response container
    responseDiv.appendChild(toggleButton);

    // Add event listener to toggle expanded/collapsed state
    toggleButton.addEventListener("click", () => {
      if (messageWrapper.style.maxHeight === "150px") {
        messageWrapper.style.maxHeight = "none"; // Expand to full height
        messageWrapper.style.overflowY = "auto"; // Allow scrolling
        toggleButton.textContent = "Show less";
      } else {
        messageWrapper.style.maxHeight = "150px"; // Collapse back
        messageWrapper.style.overflowY = "hidden"; // Hide overflow
        toggleButton.textContent = "Show more";
      }
    });
  }
}

// Close button event listener
document.getElementById("close-button").addEventListener("click", () => {
  window.close(); // Closes the extension window when "X" is clicked
});

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
