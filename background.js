  // Experimental email summary script

const RESEND_API_KEY = 'YOUR_API_KEY';
const RECIPIENT_EMAIL = 'ari@llanai.com';

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
    }
  });

console.log("Background script loaded with storage and email functionality");