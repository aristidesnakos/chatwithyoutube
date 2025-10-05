# ChatWithYouTube

ChatWithYouTube is a Chrome Browser Extension that enhances your YouTube learning experience by providing interactive chat and translation features powered by Chrome's built-in AI. This extension is designed to help language learners and anyone interested in understanding content across different languages.

## Features

1. **Translation Panel**: Instantly translate selected text on YouTube videos using Chrome's built-in AI.
2. **Furigana Support**: For Japanese content, get furigana readings to aid in pronunciation and understanding.
3. **Phrase Storage**: Save interesting phrases or words for later review.
4. **Interactive Chat**: Engage in a quiz-like conversation about stored phrases to reinforce learning.
5. **Transcript Integration**: Click on transcript segments for instant translations.
6. **Customizable UI**: Hide non-essential YouTube elements for a focused learning environment.
7. **Client-Side AI**: No API keys required - uses Chrome's native AI capabilities for privacy and offline functionality.

## How It Works

1. The extension modifies the YouTube page to add custom buttons and panels.
2. Users can select text or click on transcript segments to get translations.
3. Translations and AI interactions are powered by Chrome's built-in AI models.
4. Phrases can be stored and reviewed later.
5. The chat feature uses stored phrases to create an interactive learning experience.

## Installation

1. Clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the cloned repository folder.

## Usage

1. Navigate to a YouTube video.
2. The extension will automatically check if Chrome's built-in AI is available.
3. Select text or click on transcript segments for translations.
4. Use the eye icon (👁️) to view stored phrases.
5. Use the chat icon (💬) to start an interactive learning session.
6. Use the trash icon (🚮) to clear stored phrases.

## Requirements

- Chrome browser with built-in AI support (Chrome 127+ with appropriate flags enabled)
- **Enable Experimental Extension APIs**: Go to `chrome://flags/` and enable "Experimental Extension APIs"
- Chrome AI capabilities may require additional setup depending on your device and Chrome version

### Enabling Chrome AI Features

1. Open Chrome and navigate to `chrome://flags/`
2. Search for "Experimental Extension APIs"
3. Set it to "Enabled"
4. Restart Chrome when prompted
5. The extension will automatically check AI availability when loaded

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Technical Details

### Chrome AI Integration

This extension utilizes Chrome's experimental `chrome.ai` API with the following features:

- **Capability Checking**: Automatically detects if AI is available (`readily`, `after-download`, or `no`)
- **Text Generation**: Uses Chrome's built-in Gemini Nano model for translations and responses
- **Session Management**: Properly creates and destroys AI sessions to manage resources
- **Error Handling**: Graceful fallbacks when AI is unavailable or downloading

### API Usage

The extension can be called programmatically:

```javascript
// Generate AI text
chrome.runtime.sendMessage({
  action: 'generateAIText',
  prompt: 'Translate this text to English: こんにちは'
}, (response) => {
  if (response.success) {
    console.log(response.text);
  }
});
```

## Disclaimer

This extension uses Chrome's experimental built-in AI capabilities. The availability and functionality may depend on your browser version, system configuration, and whether the AI model has been downloaded. No external API keys are required, ensuring your data stays private and secure on-device.
