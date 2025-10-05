  // Experimental email summary script

const RESEND_API_KEY = 'YOUR_API_KEY';
const RECIPIENT_EMAIL = 'ari@llanai.com';

// Chrome AI functionality
async function generateText(prompt) {
  try {
    // Check if chrome.ai is available
    if (!chrome.ai || !chrome.ai.canUseTextCapability) {
      console.error("Chrome AI API not available. Check Chrome version and flags.");
      return "Chrome AI Not Available\nRequirements: Chrome 138+ (Dev/Canary), 22GB storage, GPU >4GB VRAM\n\nEnable in chrome://flags:\n• #prompt-api-for-gemini-nano\n• #optimization-guide-on-device-model";
    }

    // Check if the text capability is available
    const capability = await chrome.ai.canUseTextCapability();

    if (capability === "no") {
      console.error("Built-in AI text capability is not available.");
      return "Chrome AI Not Available\nRequirements: Chrome 138+ (Dev/Canary), 22GB storage, GPU >4GB VRAM\n\nEnable in chrome://flags:\n• #prompt-api-for-gemini-nano\n• #optimization-guide-on-device-model\n\nAlso check: Hardware requirements (GPU >4GB VRAM)";
    } else if (capability === "readily") {
      // The model is available and ready to use
      console.log("AI is ready. Creating text session...");

      // Create a text session
      const session = await chrome.ai.createTextSession();
      
      // Send the prompt to the model and stream the response
      const stream = session.promptStreaming(prompt);

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
      }
      
      // Clean up the session
      session.destroy();
      
      return fullResponse;
    } else if (capability === "after-download") {
      console.log("AI model is downloading. Please try again later.");
      return "AI model is being downloaded. Please try again in a few minutes.\n\nThis can take 10-15 minutes depending on your connection.";
    }
  } catch (error) {
    console.error("Error using the AI model:", error);
    
    // Provide more specific error guidance
    if (error.message.includes("not available")) {
      return "Chrome AI Not Available\nRequirements: Chrome 138+ (Dev/Canary), 22GB storage, GPU >4GB VRAM\n\nEnable in chrome://flags:\n• #prompt-api-for-gemini-nano\n• #optimization-guide-on-device-model";
    }
    
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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
    } else if (request.action === 'runDiagnostics') {
      runChromeAIDiagnostics()
        .then((diagnostics) => sendResponse({ success: true, diagnostics }))
        .catch((error) => {
          console.error('Error running diagnostics:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously
    } else if (request.action === 'getDiagnostics') {
      chrome.storage.local.get('chromeAiDiagnostics', (result) => {
        sendResponse({ success: true, diagnostics: result.chromeAiDiagnostics });
      });
      return true; // Will respond asynchronously
    }
  });

// Comprehensive Chrome AI diagnostics
async function runChromeAIDiagnostics() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    chromeVersion: /Chrome\/([0-9.]+)/.exec(navigator.userAgent)?.[1] || 'Unknown',
    results: {}
  };

  console.log('🔍 Starting Chrome AI Diagnostics...');
  console.log('User Agent:', diagnostics.userAgent);
  console.log('Chrome Version:', diagnostics.chromeVersion);

  // Test 1: Check if chrome.ai exists
  diagnostics.results.chromeAiExists = !!chrome.ai;
  console.log('✓ chrome.ai exists:', diagnostics.results.chromeAiExists);

  if (!chrome.ai) {
    console.error('❌ chrome.ai is not available. This usually means:');
    console.error('   • Chrome version is too old (need 138+)');
    console.error('   • Required flags are not enabled');
    console.error('   • Running on unsupported OS/architecture');
    return diagnostics;
  }

  // Test 2: Check available methods
  const methods = ['getAvailability', 'canUseTextCapability', 'createTextSession'];
  methods.forEach(method => {
    diagnostics.results[`${method}Available`] = typeof chrome.ai[method] === 'function';
    console.log(`✓ chrome.ai.${method} available:`, diagnostics.results[`${method}Available`]);
  });

  // Test 3: Check getAvailability if available
  if (chrome.ai.getAvailability) {
    try {
      diagnostics.results.getAvailabilityResult = await chrome.ai.getAvailability();
      console.log('✓ chrome.ai.getAvailability():', diagnostics.results.getAvailabilityResult);
    } catch (error) {
      diagnostics.results.getAvailabilityError = error.message;
      console.error('❌ chrome.ai.getAvailability() failed:', error);
    }
  }

  // Test 4: Check canUseTextCapability if available
  if (chrome.ai.canUseTextCapability) {
    try {
      diagnostics.results.canUseTextCapabilityResult = await chrome.ai.canUseTextCapability();
      console.log('✓ chrome.ai.canUseTextCapability():', diagnostics.results.canUseTextCapabilityResult);
    } catch (error) {
      diagnostics.results.canUseTextCapabilityError = error.message;
      console.error('❌ chrome.ai.canUseTextCapability() failed:', error);
    }
  }

  // Test 5: Try creating a session if capability is ready
  if (diagnostics.results.canUseTextCapabilityResult === 'readily' && chrome.ai.createTextSession) {
    try {
      const session = await chrome.ai.createTextSession();
      diagnostics.results.sessionCreated = true;
      console.log('✓ Text session created successfully');
      
      // Test basic prompt
      try {
        const response = await session.prompt('Hello');
        diagnostics.results.basicPromptWorks = true;
        diagnostics.results.basicPromptResponse = response;
        console.log('✓ Basic prompt test successful:', response);
      } catch (promptError) {
        diagnostics.results.basicPromptError = promptError.message;
        console.error('❌ Basic prompt test failed:', promptError);
      }
      
      session.destroy();
    } catch (sessionError) {
      diagnostics.results.sessionError = sessionError.message;
      console.error('❌ Session creation failed:', sessionError);
    }
  }

  console.log('🔍 Diagnostics complete:', diagnostics);
  return diagnostics;
}

// Check Chrome AI availability on startup
chrome.runtime.onInstalled.addListener(async () => {
  const diagnostics = await runChromeAIDiagnostics();
  
  // Store diagnostics for debugging
  chrome.storage.local.set({ 'chromeAiDiagnostics': diagnostics });
});

console.log("Background script loaded with storage, email, and AI functionality");