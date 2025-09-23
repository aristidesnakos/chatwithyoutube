const ELEMENTS_TO_HIDE = ['#comments', '#chat', '#related'];

// Chrome built-in AI session for chat
let aiSession = null;

// Function to get the browser's language name
function getBrowserLanguage() {
  const langCode = navigator.language || navigator.userLanguage;
  const languageMap = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'ja': 'Japanese',
    'de': 'German',
    'zh': 'Chinese',
    'el': 'Greek',
    // Add other language codes and names as needed
  };
  return languageMap[langCode.split('-')[0]] || 'English'; // Default to English
}

// Chrome Built-in AI Helper Functions
async function initializeAI() {
  try {
    // Check for window.ai.languageModel (current Chrome implementation)
    if (window.ai && window.ai.languageModel) {
      console.log('Found window.ai.languageModel API');
      const capabilities = await window.ai.languageModel.capabilities();
      console.log('AI Capabilities:', capabilities);
      
      if (capabilities.available === 'readily') {
        return true;
      } else if (capabilities.available === 'after-download') {
        console.log('Chrome AI model needs to be downloaded');
        return 'downloadable';
      } else {
        throw new Error(`Chrome AI not available: ${capabilities.available}`);
      }
    }
    
    // Check for future LanguageModel API
    if (typeof LanguageModel !== 'undefined') {
      console.log('Found LanguageModel API');
      const availability = await LanguageModel.availability();
      console.log('LanguageModel availability:', availability);
      
      if (availability === 'available' || availability === 'readily') {
        return true;
      } else if (availability === 'downloadable') {
        return 'downloadable';
      } else {
        throw new Error(`LanguageModel not available: ${availability}`);
      }
    }
    
    throw new Error('No Chrome AI API found. Make sure flags are enabled and Chrome is restarted.');
  } catch (error) {
    console.error('Chrome AI initialization failed:', error);
    return false;
  }
}

async function createAISession() {
  try {
    // Use window.ai.languageModel (current implementation)
    if (window.ai && window.ai.languageModel) {
      console.log('Creating session with window.ai.languageModel');
      const session = await window.ai.languageModel.create({
        temperature: 0.7,
        topK: 40,
      });
      console.log('Session created successfully');
      return session;
    }
    
    // Try future LanguageModel API
    if (typeof LanguageModel !== 'undefined') {
      console.log('Creating session with LanguageModel');
      const params = await LanguageModel.params();
      return await LanguageModel.create({
        temperature: params.defaultTemperature,
        topK: params.defaultTopK,
      });
    }
    
    throw new Error('Chrome built-in AI not available');
  } catch (error) {
    console.error('Failed to create AI session:', error);
    throw error;
  }
}

async function promptAI(session, prompt) {
  try {
    console.log('Sending prompt to AI:', prompt);
    const response = await session.prompt(prompt);
    console.log('AI response:', response);
    return response;
  } catch (error) {
    console.error('AI prompt failed:', error);
    throw error;
  }
}

function createSidebar() {
  if (document.getElementById('yll-sidebar')) {
    return;
  }
  
  const sidebar = document.createElement('div');
  sidebar.id = 'yll-sidebar';
  sidebar.innerHTML = `
    <button id="yll-sidebar-toggle" class="sidebar-toggle">☰</button>
    <div id="yll-sidebar-content">
      <div class="sidebar-header">
        <h3>Chat with YouTube</h3>
        <button id="yll-sidebar-close">×</button>
      </div>
      
      <div class="sidebar-section">
        <h4>AI Status</h4>
        <div id="aiModelInfo">
          <p>Chrome Built-in AI (Gemini Nano)</p>
          <div id="aiModelStatus">Checking availability...</div>
          <button id="yll-check-ai" class="sidebar-btn">Re-check AI Status</button>
          <button id="yll-test-ai" class="sidebar-btn" style="display: none;">Test AI Translation</button>
        </div>
      </div>
      
      <div class="sidebar-section">
        <h4>Transcript & Chat</h4>
        <button id="yll-toggle-transcript-button" class="sidebar-btn">📝 Show Transcript</button>
        <button id="yll-chat-phrases-button" class="sidebar-btn">💬 Chat with Transcript</button>
      </div>
      
      <div class="sidebar-section">
        <h4>Stored Phrases</h4>
        <button id="yll-show-phrases-button" class="sidebar-btn">📖 View Stored Phrases</button>
        <button id="yll-clear-phrases-button" class="sidebar-btn danger">🗑️ Clear All Phrases</button>
      </div>
      
      <div class="sidebar-section">
        <h4>Page Controls</h4>
        <button id="yll-toggle-elements-button" class="sidebar-btn">💬 Show Comments</button>
        <button id="yll-toggle-sidebar-button" class="sidebar-btn">📺 Show Related</button>
      </div>
      
      <div id="yll-chat-container" style="display: none;">
        <div class="chat-header">
          <h4>Chat with Transcript</h4>
          <button id="yll-close-chat" class="chat-close">×</button>
        </div>
        <div id="yll-chat-messages"></div>
        <div id="yll-chat-input-area">
          <input type="text" id="yll-chat-input" placeholder="Type your message...">
          <button id="yll-chat-send">Send</button>
        </div>
        <button id="yll-clear-chat-history" class="sidebar-btn">Clear History</button>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);
  
  // Initialize sidebar state
  const toggleBtn = document.getElementById('yll-sidebar-toggle');
  const closeBtn = document.getElementById('yll-sidebar-close');
  
  // Handle sidebar toggle
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });
  
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

function addApiKeyBox() {
  // This function is now replaced by createSidebar
  // Keep empty for compatibility

  // Check Chrome AI availability
  initializeAI().then(status => {
    if (status === 'downloadable') {
      updateAIModelStatus('downloadable');
    } else {
      updateAIModelStatus(status);
    }
  }).catch(() => {
    updateAIModelStatus(false);
  });

  function updateAIModelStatus(status) {
    const aiModelStatus = document.getElementById('aiModelStatus');
    const testButton = document.getElementById('yll-test-ai');
    if (aiModelStatus) {
      if (status === true) {
        aiModelStatus.innerHTML = '<div style="background-color: #2ade27; color: #060608; padding: 5px; border-radius: 3px;">Chrome AI Ready ✓</div>';
        if (testButton) testButton.style.display = 'block';
      } else if (status === 'downloadable') {
        aiModelStatus.innerHTML = `
          <div style="background-color: #ffa500; color: #000000; padding: 5px; border-radius: 3px; margin-bottom: 10px;">
            Chrome AI Model Needs Download
          </div>
          <div style="font-size: 12px; margin-top: 10px; line-height: 1.4;">
            <b>The AI model will download on first use.</b><br>
            This is a one-time ~22GB download.<br>
            Click "Test AI Translation" to start download.
          </div>
        `;
        if (testButton) testButton.style.display = 'block';
      } else {
        aiModelStatus.innerHTML = `
          <div style="background-color: #ff5733; color: #ffffff; padding: 5px; border-radius: 3px; margin-bottom: 10px;">
            Chrome AI Not Available ✗
          </div>
          <div style="font-size: 12px; margin-top: 10px; line-height: 1.4;">
            <b>Requirements:</b><br>
            • Chrome 138+ (Dev/Canary)<br>
            • 22GB free storage<br>
            • GPU with >4GB VRAM<br>
            • Unlimited data connection<br><br>
            <b>To enable:</b><br>
            1. Go to <code>chrome://flags</code><br>
            2. Enable: <code>#prompt-api-for-gemini-nano</code><br>
            3. Enable: <code>#optimization-guide-on-device-model</code><br>
            4. Restart Chrome<br>
            5. Go to <code>chrome://components</code><br>
            6. Update "Optimization Guide On Device Model"<br>
            7. Reload this page
          </div>
        `;
      }
    }
  }
  
  // Add button functionality
  setTimeout(() => {
    // Re-check button
    const checkButton = document.getElementById('yll-check-ai');
    if (checkButton) {
      checkButton.addEventListener('click', async () => {
        checkButton.disabled = true;
        checkButton.textContent = 'Checking...';
        
        const aiModelStatus = document.getElementById('aiModelStatus');
        if (aiModelStatus) {
          aiModelStatus.innerHTML = 'Checking AI availability...';
        }
        
        const status = await initializeAI();
        updateAIModelStatus(status);
        
        checkButton.disabled = false;
        checkButton.textContent = 'Re-check AI Status';
      });
    }
    
    // Test button
    const testButton = document.getElementById('yll-test-ai');
    if (testButton) {
      testButton.addEventListener('click', async () => {
        testButton.disabled = true;
        testButton.textContent = 'Testing...';
        
        try {
          const session = await createAISession();
          const result = await session.prompt('Translate "Hello World" to Japanese');
          
          // Show result in status
          const aiModelStatus = document.getElementById('aiModelStatus');
          if (aiModelStatus) {
            aiModelStatus.innerHTML = `
              <div style="background-color: #2ade27; color: #060608; padding: 5px; border-radius: 3px;">
                Chrome AI Works! ✓
              </div>
              <div style="font-size: 12px; margin-top: 5px;">
                Test Result: ${result}
              </div>
            `;
          }
          
          testButton.textContent = 'Test Successful!';
          testButton.style.backgroundColor = '#28a745';
        } catch (error) {
          console.error('AI test failed:', error);
          testButton.textContent = 'Test Failed';
          testButton.style.backgroundColor = '#dc3545';
          
          const aiModelStatus = document.getElementById('aiModelStatus');
          if (aiModelStatus) {
            aiModelStatus.innerHTML += `
              <div style="font-size: 12px; margin-top: 5px; color: red;">
                Error: ${error.message}
              </div>
            `;
          }
        }
      });
    }
  }, 500);
}

function hideNonEssentialElements() {
  // Simple approach - hide comments and related videos
  const elementsToHide = ['#comments', '#chat', '#related'];
  
  elementsToHide.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = 'none';
    }
  });
}

function createTranslationPanel() {
  const panel = document.createElement('div');
  panel.id = 'yll-translation-panel';
  panel.innerHTML = `
    <h3>Translation</h3>
    <p id="yll-original-text"></p>
    <p id="yll-input-language"></p>
    <p id="yll-furigana" style="display: none;"></p>
    <p id="yll-translated-text"></p>
    <button id="yll-fetch-furigana" style="display: none;">Get Furigana</button>
    <button id="yll-close-translation">Close</button>
  `;
  document.body.appendChild(panel);
  
  document.getElementById('yll-close-translation').addEventListener('click', () => {
    panel.style.display = 'none';
  });
  
  document.getElementById('yll-fetch-furigana').addEventListener('click', async () => {
    const originalText = panel.querySelector('#yll-original-text span').textContent;
    await showFurigana(originalText);
  });
  
  return panel;
}

async function fetchTranslation(text) {
  const targetLanguage = getBrowserLanguage();
  
  try {
    const session = await createAISession();
    const prompt = `Translate the following text into ${targetLanguage}. Respond in JSON format with 'translation' and 'input_language' fields.

Please translate and identify the language of: "${text}"

Example response format:
{"translation": "translated text here", "input_language": "detected language name"}`;

    const response = await promptAI(session, prompt);
    
    // Try to parse JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      console.warn('AI response was not valid JSON, attempting to parse manually:', response);
      
      // Simple fallback - extract translation from response
      const translationMatch = response.match(/translation["\s]*:["\s]*([^"]+)/i);
      const languageMatch = response.match(/input_language["\s]*:["\s]*([^"]+)/i);
      
      return {
        translation: translationMatch?.[1] || response,
        input_language: languageMatch?.[1] || 'Unknown'
      };
    }
  } catch (error) {
    console.error('Chrome AI translation failed:', error);
    throw new Error('Failed to translate using Chrome AI');
  }
}

async function fetchFurigana(text) {
  try {
    const session = await createAISession();
    const prompt = `Provide furigana readings for Japanese text. Respond in JSON format with a 'furigana' field.

Provide furigana for the following Japanese text: "${text}"

Example response format:
{"furigana": "text with furigana readings"}`;

    const response = await promptAI(session, prompt);
    
    // Try to parse JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      console.warn('AI response was not valid JSON, attempting to parse manually:', response);
      
      // Simple fallback - extract furigana from response
      const furiganaMatch = response.match(/furigana["\s]*:["\s]*([^"]+)/i);
      
      return {
        furigana: furiganaMatch?.[1] || response
      };
    }
  } catch (error) {
    console.error('Chrome AI furigana failed:', error);
    throw new Error('Failed to get furigana using Chrome AI');
  }
}

async function showTranslation(text) {
  const panel = document.getElementById('yll-translation-panel') || createTranslationPanel();
  panel.style.display = 'block';
  
  updateTranslationPanelContent(text, 'Loading...', 'Loading...');
  storePhrase(text);

  try {
    const cachedTranslation = await getStorageData(text);
    if (cachedTranslation) {
      updateTranslationPanelContent(text, cachedTranslation.input_language, cachedTranslation.translation);
    } else {
      const translation = await fetchTranslation(text);
      if (translation && !translation.error) {
        await setStorageData(text, translation);
        updateTranslationPanelContent(text, translation.input_language, translation.translation);
      } else {
        throw new Error('Failed to fetch translation');
      }
    }
  } catch (error) {
    console.error('Error in showTranslation:', error);
    updateTranslationPanelContent(text, 'Error', 'Failed to fetch translation');
  }
}

async function showFurigana(text) {
  const furiganaElement = document.getElementById('yll-furigana');
  furiganaElement.textContent = 'Loading furigana...';
  furiganaElement.style.display = 'block';

  try {
    const cachedFurigana = await getStorageData(`furigana_${text}`);
    if (cachedFurigana) {
      updateFuriganaContent(cachedFurigana.furigana);
    } else {
      const furiganaData = await fetchFurigana(text);
      if (furiganaData && !furiganaData.error) {
        await setStorageData(`furigana_${text}`, furiganaData);
        updateFuriganaContent(furiganaData.furigana);
      } else {
        throw new Error('Failed to fetch furigana');
      }
    }
  } catch (error) {
    console.error('Error in showFurigana:', error);
    updateFuriganaContent('Failed to fetch furigana');
  }
}

function storePhrase(phrase) {
  chrome.storage.local.get('storedPhrases', (result) => {
    let storedPhrases = result.storedPhrases || [];
    if (!storedPhrases.includes(phrase)) {
      storedPhrases.push(phrase);
      chrome.storage.local.set({ storedPhrases: storedPhrases }, () => {
        console.log('Phrase stored:', phrase);
        console.log('Total stored phrases:', storedPhrases.length);
      });
    }
  });
}

function updateTranslationPanelContent(original, inputLanguage, translation) {
  const panel = document.getElementById('yll-translation-panel');
  if (panel) {
    panel.querySelector('#yll-original-text').innerHTML = `Original: <span id="yll-selectable-text">${original}</span>`;
    panel.querySelector('#yll-input-language').textContent = `Input Language: ${inputLanguage}`;
    panel.querySelector('#yll-translated-text').textContent = `Translation: ${translation}`;
    
    const furiganaButton = panel.querySelector('#yll-fetch-furigana');
    if (inputLanguage.toLowerCase() === 'japanese') {
      furiganaButton.style.display = 'inline-block';
    } else {
      furiganaButton.style.display = 'none';
    }
    
    // Reset furigana display
    panel.querySelector('#yll-furigana').style.display = 'none';
  } else {
    console.error('Translation panel not found');
  }
}

function updateFuriganaContent(furigana) {
  const furiganaElement = document.getElementById('yll-furigana');
  if (furiganaElement) {
    furiganaElement.textContent = `Furigana: ${furigana}`;
    furiganaElement.style.display = 'block';
  } else {
    console.error('Furigana element not found');
  }
}

function getStorageData(key) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'getStorageData', key: key }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.data);
      }
    });
  });
}

function setStorageData(key, value) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'setStorageData', key: key, value: value }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.success);
      }
    });
  });
}

function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    highlightSelectedText(selection);
    showTranslation(selectedText);
    storeSelectedWord(selectedText);
  }
}

function highlightSelectedText(selection) {
  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = 'lightblue';
  span.textContent = selection.toString();
  range.deleteContents();
  range.insertNode(span);
}

async function storeSelectedWord(word) {
  const translation = await fetchTranslation(word);
  if (!translation.error) {
    chrome.runtime.sendMessage({
      action: 'storeWord',
      data: { word, translation: translation.translation }
    });
  }
}

function addTranscriptClickListener() {
  waitForElement('ytd-transcript-renderer', (transcriptContainer) => {
    transcriptContainer.addEventListener('click', (e) => {
      const segmentElement = e.target.closest('ytd-transcript-segment-renderer');
      if (segmentElement) {
        const textElement = segmentElement.querySelector('yt-formatted-string.segment-text');
        if (textElement) {
          const clickedText = textElement.textContent.trim();
          showTranslation(clickedText);
        }
      }
    });
  });
}

function waitForElement(selector, callback, maxAttempts = 60, interval = 1000) {
  let attempts = 0;
  const checkElement = () => {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkElement, interval);
    } else {
      console.error(`Element not found after ${maxAttempts} attempts: ${selector}`);
    }
  };
  checkElement();
}

function addShowPhrasesButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-show-phrases-button');
  if (button) {
    button.addEventListener('click', showStoredPhrases);
  }
}

function showStoredPhrases() {
  chrome.storage.local.get('storedPhrases', (result) => {
    const storedPhrases = result.storedPhrases || [];
    const panel = document.getElementById('yll-phrases-panel') || createPhrasesPanel();
    panel.style.display = 'block';
    
    let content = '<ul>';
    storedPhrases.forEach(phrase => {
      content += `<li>${phrase}</li>`;
    });
    content += '</ul>';
    
    panel.querySelector('#yll-phrases-content').innerHTML = content;
  });
}

function createPhrasesPanel() {
  const panel = document.createElement('div');
  panel.id = 'yll-phrases-panel';
  panel.innerHTML = `
    <div id="yll-phrases-header">
      <h3>Stored Phrases</h3>
      <button id="yll-close-phrases">X</button>
    </div>
    <div id="yll-phrases-content"></div>
  `;
  document.body.appendChild(panel);

  // Use a more specific selector to target the close button within the header
  panel.querySelector('#yll-phrases-header #yll-close-phrases').addEventListener('click', () => {
    panel.style.display = 'none';
  });

  return panel;
}

function addChatWithPhrasesButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-chat-phrases-button');
  if (button) {
    button.addEventListener('click', async () => {
      const chatContainer = document.getElementById('yll-chat-container');
      const sidebar = document.getElementById('yll-sidebar');
      
      // Make sure sidebar is open
      sidebar.classList.add('open');
      
      // Show chat container within sidebar
      chatContainer.style.display = 'block';
      
      const storedPhrases = await getStorageData('storedPhrases') || [];
      if (storedPhrases.length === 0) {
        addMessageToChat('System', 'No stored phrases found. Please store some phrases first.');
        return;
      }

      addMessageToChat('System', 'Starting chat with stored phrases. I will ask you questions about these phrases or ask you to use them in sentences.');
      await sendChatMessage('Start the quiz', true);
    });
  }
}

function createChatUI() {
  // Chat UI is now built into the sidebar
  const closeChat = document.getElementById('yll-close-chat');
  const sendBtn = document.getElementById('yll-chat-send');
  const chatInput = document.getElementById('yll-chat-input');
  const clearHistory = document.getElementById('yll-clear-chat-history');
  
  if (closeChat) {
    closeChat.addEventListener('click', () => {
      document.getElementById('yll-chat-container').style.display = 'none';
    });
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendChatMessage());
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChatMessage();
    });
  }
  
  if (clearHistory) {
    clearHistory.addEventListener('click', async () => {
      await setStorageData('chatHistory', []);
      document.getElementById('yll-chat-messages').innerHTML = '';
      addMessageToChat('System', 'Chat history cleared.');
    });
  }
}

async function sendChatMessage(message, isSystem = false) {
  if (!isSystem) {
    message = document.getElementById('yll-chat-input').value;
    document.getElementById('yll-chat-input').value = '';
  }

  if (message.trim() === '') return;

  addMessageToChat('You', message);

  const storedPhrases = await getStorageData('storedPhrases') || [];
  const targetLanguage = getBrowserLanguage();
  
  // Retrieve past messages from memory
  const pastMessages = await getStorageData('chatHistory') || [];

  // Add the current message to the memory
  pastMessages.push({ role: 'user', content: message });

  try {
    // Create or reuse AI session for chat
    if (!aiSession) {
      aiSession = await createAISession();
    }

    // Build conversation context
    const systemPrompt = `You are a language learning assistant. The user has stored the following phrases: ${storedPhrases.join(', ')}. Create a quiz-like conversation using these phrases in ${targetLanguage}. Communicate entirely in ${targetLanguage}, asking about their meanings or requesting sentences using them. Ask only one question at a time.`;
    
    // Build conversation history
    let conversationHistory = systemPrompt + '\n\n';
    pastMessages.forEach(msg => {
      conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    const reply = await promptAI(aiSession, conversationHistory);
    
    // Add the assistant's reply to memory
    pastMessages.push({ role: 'assistant', content: reply });
    await setStorageData('chatHistory', pastMessages); // Save updated chat history

    addMessageToChat('Assistant', reply);
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    addMessageToChat('System', 'Failed to get a response. Chrome AI may not be available. Please try again.');
    
    // Reset AI session on error
    aiSession = null;
  }
}

function addMessageToChat(sender, message) {
  const chatMessages = document.getElementById('yll-chat-messages');
  const messageElement = document.createElement('div');
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addClearPhrasesButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-clear-phrases-button');
  if (button) {
    button.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all stored phrases?')) {
        chrome.storage.local.set({ storedPhrases: [] }, () => {
          console.log('Stored phrases cleared');
          alert('Stored phrases have been cleared.');
        });
      }
    });
  }
}

// Simplified - moved logic directly into initializeExtension

// Define this function before it's called
function addToggleButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-toggle-elements-button');
  if (button) {
    let elementsVisible = false;
    
    button.addEventListener('click', () => {
      elementsVisible = !elementsVisible;
      toggleElementsVisibility(elementsVisible);
      button.textContent = elementsVisible ? '💬 Hide Comments' : '💬 Show Comments';
    });
  }
}

// Simple toggle for comments
function toggleElementsVisibility(show) {
  const comments = document.querySelector('#comments');
  if (comments) {
    comments.style.display = show ? 'block' : 'none';
  }
}

// Define this function to add the sidebar toggle button
function addSidebarToggleButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-toggle-sidebar-button');
  if (button) {
    let sidebarVisible = false;
    
    button.addEventListener('click', () => {
      sidebarVisible = !sidebarVisible;
      toggleSidebarVisibility(sidebarVisible);
      button.textContent = sidebarVisible ? '📺 Hide Related' : '📺 Show Related';
    });
  }
}

// Simple toggle for sidebar (related videos)
function toggleSidebarVisibility(show) {
  const related = document.querySelector('#related');
  if (related) {
    related.style.display = show ? 'block' : 'none';
  }
}

function addTranscriptToggleButton() {
  // Now integrated into sidebar
  const button = document.getElementById('yll-toggle-transcript-button');
  if (button) {
    let transcriptVisible = false;
    
    // Function to check for transcript availability
    function checkTranscriptAvailability() {
      const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer ytd-button-renderer yt-button-shape button');
      
      if (!transcriptButton) {
        button.textContent = '📝 No Transcript';
        button.classList.add('disabled');
        button.disabled = true;
      } else {
        button.textContent = transcriptVisible ? '📝 Hide Transcript' : '📝 Show Transcript';
        button.classList.remove('disabled');
        button.disabled = false;
      }
    }
    
    // Initial check for transcript availability
    checkTranscriptAvailability();
    
    button.addEventListener('click', () => {
      transcriptVisible = !transcriptVisible;
      toggleTranscriptVisibility(transcriptVisible);
      if (!button.disabled) {
        button.textContent = transcriptVisible ? '📝 Hide Transcript' : '📝 Show Transcript';
      }
    });
    
    // Check transcript availability periodically
    setInterval(checkTranscriptAvailability, 5000);
  }
}

function toggleTranscriptVisibility(show) {
  const transcriptRenderer = document.querySelector('ytd-transcript-renderer');
  
  if (show && !transcriptRenderer) {
    // Try to open transcript
    const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer button');
    if (transcriptButton) {
      transcriptButton.click();
    }
  } else if (transcriptRenderer) {
    // Simply show/hide existing transcript
    transcriptRenderer.style.display = show ? 'block' : 'none';
  }
}

function openTranscriptAutomatically() {
  // Simple approach - click transcript button if available
  const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer button[aria-label*="transcript" i], ytd-video-description-transcript-section-renderer button[aria-label*="script" i]');
  
  if (transcriptButton) {
    transcriptButton.click();
    console.log('Transcript opened automatically');
    
    // Update toggle button
    const toggleButton = document.getElementById('yll-toggle-transcript-button');
    if (toggleButton) {
      toggleButton.textContent = 'Hide Transcript';
    }
  }
}

function isShortsPage() {
  return window.location.pathname.startsWith('/shorts/');
}

function removeExtensionElements() {
  // Remove all extension elements
  const extensionElements = [
    'yll-sidebar',
    'yll-translation-panel',
    'yll-phrases-panel'
  ];
  
  extensionElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });
}

let extensionInitialized = false;

function initializeExtension() {
  // Prevent multiple initializations
  if (extensionInitialized) {
    return;
  }
  
  // First, remove any existing elements added by the extension
  removeExtensionElements();

  if (isShortsPage()) {
    console.log('YouTube Shorts page detected, skipping.');
    return;
  }

  // Wait for YouTube page to load then apply modifications
  waitForElement('ytd-watch-flexy', () => {
    // Double-check to prevent race conditions
    if (extensionInitialized) {
      return;
    }
    
    console.log('YouTube video page detected, modifying page');
    extensionInitialized = true;
    
    // Core functionality
    hideNonEssentialElements();
    
    // Create the main sidebar
    if (!document.getElementById('yll-sidebar')) {
      createSidebar();
      
      // Initialize all button handlers
      addApiKeyBox();
      addTranscriptToggleButton();
      addToggleButton();
      addSidebarToggleButton();
      addShowPhrasesButton();
      addChatWithPhrasesButton();
      addClearPhrasesButton();
      createChatUI();
    }
    
    // Auto-open transcript after a delay
    setTimeout(() => {
      openTranscriptAutomatically();
      addTranscriptClickListener();
    }, 3000);
  });
}

// Watch for URL changes using a more efficient method
let lastUrl = location.href;
setInterval(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    extensionInitialized = false; // Reset flag for new page
    console.log('URL changed, reinitializing extension');
    initializeExtension();
  }
}, 1000);

// Event Listeners
document.addEventListener('click', function (e) {
  if (
    e.target &&
    e.target.closest('ytd-button-renderer[aria-label="Show transcript"]')
  ) {
    setTimeout(() => {
      const transcriptRenderer = document.querySelector('ytd-transcript-renderer');
      if (transcriptRenderer) {
        transcriptRenderer.style.display = 'block';
      }
    }, 500);
  }
});

// Initialize the extension
initializeExtension();