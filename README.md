# ChatWithYouTube

ChatWithYouTube is a Chrome Browser Extension that enhances your YouTube learning experience by providing interactive chat and translation features powered by Chrome's built-in AI. This extension is designed to help language learners and anyone interested in understanding content across different languages.

## ⚠️ Development Mode Notice

**This extension is currently in development mode** and requires Chrome's experimental AI features. Chrome's built-in AI capabilities are not yet officially released and are only available in Chrome Dev/Canary builds with specific flags enabled. This extension will remain in development status until Google officially releases Chrome AI to stable channels.

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

- **Chrome 138+ (Dev/Canary channel)** - Standard Chrome does not yet support built-in AI
- **22GB free storage** - Required for downloading the AI model
- **GPU with >4GB VRAM** - Necessary for on-device AI processing
- Chrome AI capabilities require specific flags to be enabled

### Enabling Chrome AI Features

**Required Chrome Flags:**
1. Open Chrome and navigate to `chrome://flags/`
2. Enable these specific flags:
   - **#prompt-api-for-gemini-nano** - Set to "Enabled"
   - **#optimization-guide-on-device-model** - Set to "Enabled"
   - **#experimental-extension-apis** - Set to "Enabled" (for extension development)
   - **#enable-unsafe-webgpu** - Set to "Enabled" (for hardware acceleration)
   - **#enable-experimental-web-platform-features** - Set to "Enabled"
3. Restart Chrome when prompted
4. The AI model will download automatically (10-15 minutes)
5. The extension will automatically check AI availability when loaded

### Verifying AI Model Installation

**Check Chrome Components:**
1. Navigate to `chrome://components/`
2. Look for "**Optimization Guide On-Device Model**"
3. If status shows "Component not updated" or "Update error":
   - Click "Check for update" button
   - Wait for download to complete (may take 10-15 minutes)
4. If component is missing entirely, your Chrome version or hardware may be incompatible

**Note:** If you continue seeing "Chrome AI Not Available" errors after following all steps, check the browser console for detailed availability status logging.

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
