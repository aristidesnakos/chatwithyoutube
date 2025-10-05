  // Experimental email summary script

const RESEND_API_KEY = 'YOUR_API_KEY';
const RECIPIENT_EMAIL = 'ari@llanai.com';

// Chrome AI functionality
async function generateText(prompt) {
  try {
    // First, check if the text capability is available.
    const capability = await chrome.ai.canUseTextCapability();

    if (capability === "no") {
      console.error("Built-in AI text capability is not available.");
      return "AI is not available right now.";
    } else if (capability === "readily") {
      // The model is available and ready to use.
      console.log("AI is ready. Creating text session...");

      // Create a text session.
      const session = await chrome.ai.createTextSession();
      
      // Send the prompt to the model and stream the response.
      const stream = session.promptStreaming(prompt);

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
      }
      
      // Clean up the session.
      session.destroy();
      
      return fullResponse;
    } else if (capability === "after-download") {
      console.log("AI model is downloading. Please try again later.");
      return "AI model is being downloaded. Please try again in a few minutes.";
    }
  } catch (error) {
    console.error("Error using the AI model:", error);
    return `Error: ${error.message}`;
  }
}

function createEmailContent(words) {
  let content = '<h1>Your Daily Language Learning Words</h1>';
  content += '<ul>';
  words.forEach(({ word, translation }) => {
    content += `<li><strong>${word}</strong>: ${translation}</li>`;
  });
  content += '</ul>';
  return content;
}

async function sendEmail(content) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ari@llanai.com',
      to: RECIPIENT_EMAIL,
      subject: 'Your Daily Language Learning Words',
      html: content
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  console.log('Daily email sent successfully');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStorageData') {
      chrome.storage.local.get(request.key, (result) => {
        sendResponse({ data: result[request.key] });
      });
      return true; // Will respond asynchronously
    } else if (request.action === 'setStorageData') {
      chrome.storage.local.set({ [request.key]: request.value }, () => {
        sendResponse({ success: true });
      });
      return true; // Will respond asynchronously
    } else if (request.action === 'storeWord') {
      chrome.storage.local.get('selectedWords', (result) => {
        let selectedWords = result.selectedWords || [];
        selectedWords.push(request.data);
        chrome.storage.local.set({ selectedWords: selectedWords }, () => {
          console.log('Word stored:', request.data.word);
          sendResponse({ success: true });
        });
      });
      return true; // Will respond asynchronously
    } else if (request.action === 'sendEmail') {
      sendEmail(request.content)
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          console.error('Error sending email:', error);
          sendResponse({ success: false });
        });
      return true; // Will respond asynchronously
    } else if (request.action === 'generateAIText') {
      generateText(request.prompt)
        .then((response) => sendResponse({ success: true, text: response }))
        .catch((error) => {
          console.error('Error generating AI text:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously
    }
  });

console.log("Background script loaded with storage, email, and AI functionality");