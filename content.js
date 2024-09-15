const ELEMENTS_TO_HIDE = ['#comments', '#chat', '#related'];

const API_URL = 'https://api.openai.com/v1/chat/completions';

function addApiKeyBox() {
  const apiKeyBox = document.createElement('div');
  apiKeyBox.id = 'yll-api-key-box';
  apiKeyBox.innerHTML = `
    <div id="yll-api-key-content">
      <div id="yll-api-key-header">
        <h3>OpenAI API Key</h3>
        <button id="yll-toggle-api-key-box">ー</button>
      </div>
      <div id="apiKeyContainer">
        <input type="password" id="apiKey" placeholder="Enter your OpenAI API Key" />
        <span id="toggleVisibility">👁️</span>
        <span id="copyApiKey">📋</span>
      </div>
      <button id="saveKey">Save API Key</button>
      <div id="apiKeyStatus"></div>
    </div>
  `;
  document.body.appendChild(apiKeyBox);

  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyButton = document.getElementById('saveKey');
  const toggleVisibilityButton = document.getElementById('toggleVisibility');
  const copyApiKeyButton = document.getElementById('copyApiKey');
  const apiKeyStatus = document.getElementById('apiKeyStatus');

  // Check if API key exists and update UI
  chrome.storage.sync.get('openaiApiKey', (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
      updateApiKeyStatus(true);
    } else {
      updateApiKeyStatus(false);
    }
  });

  saveKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      updateApiKeyStatus(true);
    });
  });

  const apiKeyContent = document.getElementById('yll-api-key-content');
  const toggleButton = document.getElementById('yll-toggle-api-key-box');

  let isMinimized = false;

  toggleButton.addEventListener('click', () => {
    isMinimized = !isMinimized;
    if (isMinimized) {
      apiKeyContent.style.display = 'none';
      apiKeyBox.classList.add('minimized');
      toggleButton.textContent = '🔑';
    } else {
      apiKeyContent.style.display = 'block';
      apiKeyBox.classList.remove('minimized');
      toggleButton.textContent = 'ー';
    }
  });

  toggleVisibilityButton.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  });

  copyApiKeyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(apiKeyInput.value).then(() => {
      alert('API Key copied to clipboard');
    });
  });

  function updateApiKeyStatus(isEntered) {
    apiKeyStatus.textContent = isEntered ? 'API Key Entered' : 'API Key Missing';
    apiKeyStatus.className = isEntered ? 'status-entered' : 'status-missing';
  }
}

function hideNonEssentialElements() {
  ELEMENTS_TO_HIDE.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = 'none';
    });
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
  const apiKey = await getApiKey();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Provide translations for various language learning scenarios. Respond in JSON format with 'translation' and 'input_language' fields."
        },
        {
          role: "user",
          content: `Translate the following text and identify its language: "${text}"`
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) throw new Error('Network response was not ok');

  const data = await response.json();
  return JSON.parse(data.choices[0]?.message?.content || '{}');
}

async function fetchFurigana(text) {
  const apiKey = await getApiKey();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Provide furigana readings for Japanese text. Respond in JSON format with a 'furigana' field."
        },
        {
          role: "user",
          content: `Provide furigana for the following Japanese text: "${text}"`
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) throw new Error('Network response was not ok');

  const data = await response.json();
  return JSON.parse(data.choices[0]?.message?.content || '{}');
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('openaiApiKey', (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (result.openaiApiKey) {
        resolve(result.openaiApiKey);
      } else {
        reject(new Error('API key not found'));
      }
    });
  });
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
  const button = document.createElement('button');
  button.id = 'yll-show-phrases-button';
  button.textContent = '👁️';
  button.addEventListener('click', showStoredPhrases);
  document.body.appendChild(button);
}

function showStoredPhrases() {
  chrome.storage.local.get('storedPhrases', (result) => {
    const storedPhrases = result.storedPhrases || [];
    const panel = document.getElementById('yll-translation-panel') || createTranslationPanel();
    panel.style.display = 'block';
    
    let content = '<h3>Stored Phrases</h3><ul style="padding: 10px; list-style-type: none;">';
    storedPhrases.forEach(phrase => {
      content += `<li style="margin-bottom: 8px;">${phrase}</li>`;
    });
    content += '</ul>';
    
    panel.innerHTML = content + '<button id="yll-close-translation">Close</button>';
    
    document.getElementById('yll-close-translation').addEventListener('click', () => {
      panel.style.display = 'none';
    });
  });
}

function addChatWithPhrasesButton() {
  const button = document.createElement('button');
  button.id = 'yll-chat-phrases-button';
  button.textContent = '💬';
  
  button.addEventListener('click', async () => {
    const chatPanel = document.getElementById('yll-chat-panel');
    
    if (!chatPanel) {
      createChatUI(); // Create and show the chat UI on the first click
    }
    
    // Show the chat UI immediately
    document.getElementById('yll-chat-panel').style.display = 'flex'; // Show the chat UI if it already exists
    
    const storedPhrases = await getStorageData('storedPhrases') || [];
    if (storedPhrases.length === 0) {
      addMessageToChat('System', 'No stored phrases found. Please store some phrases first.');
      return;
    }

    addMessageToChat('System', 'Starting chat with stored phrases. I will ask you questions about these phrases or ask you to use them in sentences.');
    await sendChatMessage('Start the quiz', true);
  });

  document.body.appendChild(button);
}

function createChatUI() {
  const chatPanel = document.createElement('div');
  chatPanel.id = 'yll-chat-panel';
  chatPanel.innerHTML = `
    <div id="yll-chat-messages"></div>
    <div id="yll-chat-input-area">
      <input type="text" id="yll-chat-input" placeholder="Type your message...">
      <button id="yll-chat-send">Send</button>
    </div>
    <button id="yll-close-chat">X</button>
    <button id="yll-clear-chat-history">Clear Chat History</button>
  `;
  document.body.appendChild(chatPanel);

  document.getElementById('yll-close-chat').addEventListener('click', () => {
    chatPanel.style.display = 'none';
  });

  document.getElementById('yll-chat-send').addEventListener('click', sendChatMessage);
  document.getElementById('yll-chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Clear chat history button functionality
  document.getElementById('yll-clear-chat-history').addEventListener('click', async () => {
    await setStorageData('chatHistory', []); // Clear chat history in storage
    document.getElementById('yll-chat-messages').innerHTML = ''; // Clear chat messages in UI
    addMessageToChat('System', 'Chat history cleared.'); // Notify user
  });
}

async function sendChatMessage(message, isSystem = false) {
  if (!isSystem) {
    message = document.getElementById('yll-chat-input').value;
    document.getElementById('yll-chat-input').value = '';
  }

  if (message.trim() === '') return;

  addMessageToChat('You', message);

  const storedPhrases = await getStorageData('storedPhrases') || [];
  const apiKey = await getApiKey();
  
  // Retrieve past messages from memory
  const pastMessages = await getStorageData('chatHistory') || [];

  // Add the current message to the memory
  pastMessages.push({ role: 'user', content: message });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a language learning assistant. The user has stored the following phrases: ${storedPhrases.join(', ')}. Create a quiz-like conversation using these phrases. Ask about their meanings or request sentences using them. Ask only one question at a time.`
          },
          ...pastMessages, // Include past messages in the conversation context
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    
    // Add the assistant's reply to memory
    pastMessages.push({ role: 'assistant', content: reply });
    await setStorageData('chatHistory', pastMessages); // Save updated chat history

    addMessageToChat('Assistant', reply);
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    addMessageToChat('System', 'Failed to get a response. Please try again.');
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
  const button = document.createElement('button');
  button.id = 'yll-clear-phrases-button';
  button.textContent = '🚮';
  button.addEventListener('click', () => {
    chrome.storage.local.set({ storedPhrases: [] }, () => {
      console.log('Stored phrases cleared');
      alert('Stored phrases have been cleared.');
    });
  });

  document.body.appendChild(button);
}

function modifyYouTubePage() {
  hideNonEssentialElements();
  addTranscriptClickListener();
  addShowPhrasesButton();
  addChatWithPhrasesButton();
  addClearPhrasesButton();
}

function initializeExtension() {
  addApiKeyBox();
  waitForElement('ytd-watch-flexy', () => {
    console.log('YouTube video page detected, modifying page');
    modifyYouTubePage();
  });
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, reinitializing extension');
    initializeExtension();
  }
}).observe(document, {subtree: true, childList: true});

// Event Listeners
document.addEventListener('click', function(e) {
  if (e.target && e.target.closest('ytd-button-renderer[aria-label="Show transcript"]')) {
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