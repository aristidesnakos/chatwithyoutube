# ChatWithYouTube

ChatWithYouTube is a Chrome Browser Extension that enhances your YouTube learning experience by providing interactive chat and translation features. This extension is designed to help language learners and anyone interested in understanding content across different languages.

## Features

1. **Translation Panel**: Instantly translate selected text on YouTube videos.
2. **Furigana Support**: For Japanese content, get furigana readings to aid in pronunciation and understanding.
3. **Phrase Storage**: Save interesting phrases or words for later review.
4. **Interactive Chat**: Engage in a quiz-like conversation about stored phrases to reinforce learning.
5. **Transcript Integration**: Click on transcript segments for instant translations.
6. **Customizable UI**: Hide non-essential YouTube elements for a focused learning environment.

## How It Works

1. The extension modifies the YouTube page to add custom buttons and panels.
2. Users can select text or click on transcript segments to get translations.
3. Translations are fetched using the OpenAI API (GPT-4o-mini model).
4. Phrases can be stored and reviewed later.
5. The chat feature uses stored phrases to create an interactive learning experience.

## Installation

1. Clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the cloned repository folder.

## Usage

1. Navigate to a YouTube video.
2. Enter your OpenAI API key in the provided box.
3. Select text or click on transcript segments for translations.
4. Use the eye icon (👁️) to view stored phrases.
5. Use the chat icon (💬) to start an interactive learning session.
6. Use the trash icon (🚮) to clear stored phrases.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension uses the OpenAI API and requires an API key. Please ensure you comply with OpenAI's use policies and be aware of any associated costs.
