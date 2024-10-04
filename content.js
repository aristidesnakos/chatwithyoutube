const ELEMENTS_TO_HIDE = ['#comments', '#chat', '#related'];

const API_URL = 'https://api.openai.com/v1/chat/completions';

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

function addApiKeyBox() {
  if (document.getElementById('yll-api-key-box')) {
    return;
  }
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
  const toggleButton = document.getElementById('yll-toggle-api-key-box');

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

  let isMinimized = false;
  let savedApiKey = '';

  function toggleMinimized() {
    isMinimized = !isMinimized;
    if (isMinimized) {
      savedApiKey = apiKeyInput.value; // Save the current API key
      apiKeyBox.classList.add('minimized');
      apiKeyBox.innerHTML = '🔑';
      apiKeyBox.title = 'Show API Key Box';
    } else {
      apiKeyBox.classList.remove('minimized');
      apiKeyBox.innerHTML = apiKeyBox.getAttribute('data-original-content');
      apiKeyBox.title = '';
      
      // Restore the saved API key
      const apiKeyInput = document.getElementById('apiKey');
      apiKeyInput.value = savedApiKey;
      
      // Reattach event listeners to the restored elements
      document.getElementById('yll-toggle-api-key-box').addEventListener('click', toggleMinimized);
      document.getElementById('toggleVisibility').addEventListener('click', toggleVisibility);
      document.getElementById('copyApiKey').addEventListener('click', copyApiKey);
      document.getElementById('saveKey').addEventListener('click', saveApiKey);
      
      // Update the API key status based on whether there's a saved API key
      const apiKeyStatus = document.getElementById('apiKeyStatus');
      if (savedApiKey) {
        apiKeyStatus.textContent = 'API Key Entered';
        apiKeyStatus.className = 'status-entered';
      } else {
        apiKeyStatus.textContent = 'API Key Missing';
        apiKeyStatus.className = 'status-missing';
      }
    }
  }

  // Store the original content
  apiKeyBox.setAttribute('data-original-content', apiKeyBox.innerHTML);

  toggleButton.addEventListener('click', toggleMinimized);

  function toggleVisibility() {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKeyInput.value).then(() => {
      alert('API Key copied to clipboard');
    });
  }

  function saveApiKey() {
    const apiKey = apiKeyInput.value;
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      updateApiKeyStatus(true);
    });
  }

  toggleVisibilityButton.addEventListener('click', toggleVisibility);
  copyApiKeyButton.addEventListener('click', copyApiKey);
  saveKeyButton.addEventListener('click', saveApiKey);

  // Add click event to the entire box when minimized
  apiKeyBox.addEventListener('click', (e) => {
    if (isMinimized && e.target === apiKeyBox) {
      toggleMinimized();
    }
  });

  function updateApiKeyStatus(isEntered) {
    apiKeyStatus.textContent = isEntered ? 'API Key Entered' : 'API Key Missing';
    apiKeyStatus.className = isEntered ? 'status-entered' : 'status-missing';
  }
}

function hideNonEssentialElements() {
  ['#comments', '#chat', '#secondary'].forEach(selector => {
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
  const targetLanguage = getBrowserLanguage();

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
          content: `Translate the following text into ${targetLanguage}. Respond in JSON format with 'translation' and 'input_language' fields.`,
        },
        {
          role: "user",
          content: `Please translate and identify the language of: "${text}"`,
        },
      ],
      response_format: { type: "json_object" },
    }),
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
  button.textContent = '📖';
  button.addEventListener('click', showStoredPhrases);
  document.body.appendChild(button);
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
  const button = document.createElement('button');
  button.id = 'yll-chat-phrases-button';
  button.textContent = '💬📖';
  
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
  const targetLanguage = getBrowserLanguage();
  
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
            content: `You are a language learning assistant. The user has stored the following phrases: ${storedPhrases.join(', ')}. Create a quiz-like conversation using these phrases in ${targetLanguage}. Communicate entirely in ${targetLanguage}, asking about their meanings or requesting sentences using them. Ask only one question at a time.`,
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

// Define this function before it's called
function addToggleButton() {
  const button = document.createElement('button');
  button.id = 'yll-toggle-elements-button';
  button.textContent = 'Show Comments';

  let elementsVisible = false;

  button.addEventListener('click', () => {
    elementsVisible = !elementsVisible;
    toggleElementsVisibility(elementsVisible);
    button.textContent = elementsVisible ? 'Hide Comments' : 'Show Comments';
  });

  document.body.appendChild(button);
}

// Ensure this function is defined before initializeExtension
function toggleElementsVisibility(show) {
  const displayValue = show ? 'block' : 'none';
  ['#comments', '#chat'].forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = displayValue;
    });
  });
}

// Define this function to add the sidebar toggle button
function addSidebarToggleButton() {
  const button = document.createElement('button');
  button.id = 'yll-toggle-sidebar-button';
  button.textContent = 'Show Sidebar';

  let sidebarVisible = false;

  button.addEventListener('click', () => {
    sidebarVisible = !sidebarVisible;
    toggleSidebarVisibility(sidebarVisible);
    button.textContent = sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar';
  });

  document.body.appendChild(button);
}

// Function to show/hide the sidebar
function toggleSidebarVisibility(show) {
  const displayValue = show ? 'block' : 'none';
  document.querySelectorAll('#secondary').forEach(element => {
    element.style.display = displayValue;
  });
}

function addTranscriptToggleButton() {
  const button = document.createElement('button');
  button.id = 'yll-toggle-transcript-button';
  button.textContent = 'Show Transcript';

  let transcriptVisible = false;

  // Function to check for transcript availability
  function checkTranscriptAvailability() {
    // Based on the XPath provided, construct an equivalent CSS selector
    const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer ytd-button-renderer yt-button-shape button');

    if (!transcriptButton) {
      button.textContent = 'No Transcript';
      button.style.backgroundColor = 'red';
      button.disabled = true;
    } else {
      button.textContent = 'Show Transcript';
      button.style.backgroundColor = '#065fd4';
      button.disabled = false;
    }
  }

  // Initial check for transcript availability
  checkTranscriptAvailability();

  button.addEventListener('click', () => {
    transcriptVisible = !transcriptVisible;
    toggleTranscriptVisibility(transcriptVisible);
    // Update button text only if transcript is available
    if (!button.disabled) {
      button.textContent = transcriptVisible ? 'Hide Transcript' : 'Show Transcript';
    }
  });

  document.body.appendChild(button);

  // Observe changes to the DOM to update transcript availability status
  const observer = new MutationObserver(() => {
    checkTranscriptAvailability();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function toggleTranscriptVisibility(show) {
  const transcriptRenderer = document.querySelector('ytd-transcript-renderer');
  const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer ytd-button-renderer yt-button-shape button');
  const sidebar = document.querySelector('#secondary');

  if (show) {
    // Ensure the sidebar is visible
    if (sidebar && sidebar.style.display === 'none') {
      sidebar.style.display = 'block';
    }

    if (!transcriptRenderer) {
      if (transcriptButton) {
        transcriptButton.click();
      } else {
        console.error('Transcript button not found');
        // Update the toggle button to indicate no transcript
        const toggleButton = document.getElementById('yll-toggle-transcript-button');
        if (toggleButton) {
          toggleButton.textContent = 'No Transcript';
          toggleButton.style.backgroundColor = 'red';
          toggleButton.disabled = true;
        }
      }
    } else {
      transcriptRenderer.style.display = 'block';
    }
  } else {
    if (transcriptRenderer) {
      transcriptRenderer.style.display = 'none';
    }
  }
}

function isShortsPage() {
  return window.location.pathname.startsWith('/shorts/');
}

function removeExtensionElements() {
  // Remove the API Key box if it exists
  const apiKeyBox = document.getElementById('yll-api-key-box');
  if (apiKeyBox) {
    apiKeyBox.remove();
  }

  // Remove buttons added by the extension
  const buttons = [
    'yll-toggle-transcript-button',
    'yll-toggle-elements-button',
    'yll-toggle-sidebar-button',
    'yll-show-phrases-button',
    'yll-chat-phrases-button',
    'yll-clear-phrases-button',
  ];
  buttons.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });

  // Remove translation panel
  const translationPanel = document.getElementById('yll-translation-panel');
  if (translationPanel) {
    translationPanel.remove();
  }

  // Remove phrases panel
  const phrasesPanel = document.getElementById('yll-phrases-panel');
  if (phrasesPanel) {
    phrasesPanel.remove();
  }

  // Remove chat panel
  const chatPanel = document.getElementById('yll-chat-panel');
  if (chatPanel) {
    chatPanel.remove();
  }

  // Restore any elements that were hidden
  toggleElementsVisibility(true); // Show comments and chat
  toggleSidebarVisibility(true); // Show the sidebar

  // Ensure the transcript is hidden if it was shown by the extension
  const transcriptRenderer = document.querySelector('ytd-transcript-renderer');
  if (transcriptRenderer) {
    transcriptRenderer.style.display = 'none';
  }
}

function initializeExtension() {
  // First, remove any existing elements added by the extension
  removeExtensionElements();

  if (isShortsPage()) {
    // It's a YouTube Shorts page; do not modify the page
    console.log('YouTube Shorts page detected via URL; extension will not modify the page.');
    return;
  }

  // Proceed with adding elements and modifying the YouTube page
  addApiKeyBox();
  addTranscriptToggleButton();
  addToggleButton();
  addSidebarToggleButton();
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
}).observe(document, { subtree: true, childList: true });

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