function constructPrompt(action, userInput) {
  switch (action) {
    case "summarize":
      return `Please summarize the following content:\n\n${userInput}`;
    case "generate-bullet-points":
      return `Please create bullet points for the following content:\n\n${userInput}`;
    case "draft-summary":
      return `Please draft a client summary for the following content:\n\n${userInput}`;
    default:
      throw new Error("Invalid action provided.");
  }
}

module.exports = { constructPrompt };
