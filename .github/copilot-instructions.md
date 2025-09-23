# ChatWithYouTube Chrome Extension

ChatWithYouTube is a Chrome Browser Extension that enhances YouTube learning experiences by providing interactive chat and translation features for language learners. The extension modifies YouTube video pages to add translation capabilities, phrase storage, and AI-powered chat functionality using the OpenAI API.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Environment Setup and Dependencies
- Install Node.js and npm (required for linting and validation):
  - `npm init -y` -- initializes package.json if not present
  - `npm install --save-dev eslint eslint-config-next` -- takes 10-15 seconds. NEVER CANCEL.
- No build process required - this is a pure client-side Chrome extension
- No test framework - validation is done through manual Chrome extension testing

### Code Validation and Linting
- `npx eslint content.js background.js` -- takes ~1 second. Validates JavaScript syntax and catches common issues.
- Expected warnings about unused variables are normal (createEmailContent, ELEMENTS_TO_HIDE, handleTextSelection)
- ESLint will show module type warnings - these are non-breaking and expected

### Extension Structure Validation
- Run validation script: `node test_extension.js` -- takes ~1 second. Confirms all required files exist.
- Required files that must be present:
  - `manifest.json` -- Chrome extension manifest (version 3)
  - `content.js` -- Main extension logic (27KB+)
  - `background.js` -- Service worker for storage and email functionality
  - `styles/content.css` -- Extension UI styles
  - `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png` -- Extension icons

## Manual Validation - CRITICAL

**MANUAL VALIDATION REQUIREMENT**: After making any changes to the extension code, you MUST manually test in Chrome browser:

### Installation Testing (Required for every change)
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" toggle (top right)
4. Click "Load unpacked" button
5. Select the repository directory: `/home/runner/work/chatwithyoutube/chatwithyoutube`
6. Verify extension loads without errors

### Functional Testing Scenarios
**ALWAYS test at least one complete scenario after making changes:**

#### Scenario 1: Basic Extension Integration (2-3 minutes)
1. Navigate to any YouTube video page (NOT Shorts): `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Wait for page load (extension initializes after YouTube page loads)
3. Verify UI elements appear:
   - API key box (bottom right, may be minimized)
   - Show phrases button (👁️) on right side
   - Chat button (💬📖) on right side
   - Clear phrases button (🚮) on right side
4. Verify YouTube elements are hidden: comments, chat, sidebar
5. Extension should NOT activate on YouTube Shorts pages

#### Scenario 2: Translation Workflow (3-5 minutes, requires OpenAI API key)
1. Enter valid OpenAI API key in the API key box
2. Select text from video title or description
3. Translation panel should appear with translation
4. Click "Store Phrase" to save the translation
5. Verify phrase is stored (check browser console for confirmation)

#### Scenario 3: Phrase Management (2 minutes)
1. Click show phrases button (👁️)
2. Verify stored phrases appear in popup panel
3. Test phrase deletion functionality
4. Test clear all phrases functionality

## Key Components and Navigation

### Main Files
- `content.js` -- Core extension functionality, UI creation, API calls
  - Contains: translation logic, UI management, YouTube page modification
  - Key functions: `initializeExtension()`, `fetchTranslation()`, `storePhrase()`
- `background.js` -- Service worker for storage operations and email functionality
  - Contains: storage helpers, experimental email features
- `manifest.json` -- Extension configuration and permissions
  - Permissions: storage, OpenAI API, Resend API
  - Content script runs on youtube.com/* except shorts and feeds

### Styling
- `styles/content.css` -- All extension UI styles
  - Fixed position buttons and panels
  - YouTube-specific UI modifications
  - Responsive design elements

### Configuration
- `.eslintrc.json` -- ESLint configuration (legacy format)
- `eslint.config.js` -- Modern ESLint configuration
- No webpack, TypeScript, or other build tools used

## Common Validation Steps

### Before Committing Changes
Always run these validation steps in order (total time: ~5-15 minutes):
1. `npx eslint content.js background.js` -- takes ~1 second. Code quality check.
2. `node test_extension.js` -- takes ~1 second. Structure validation.
3. `node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')); console.log('✓ Manifest valid')"` -- Syntax validation.
4. **MANDATORY**: Manual Chrome extension testing (see detailed scenarios above) -- takes 5-10 minutes.
5. NEVER skip manual testing - the extension must work in actual Chrome browser.

### Expected Validation Outputs
**ESLint warnings are EXPECTED and normal:**
```
✖ 3 problems (0 errors, 3 warnings)
- createEmailContent defined but never used
- ELEMENTS_TO_HIDE assigned but never used  
- handleTextSelection defined but never used
```

**Structure validation should show:**
```
✓ Manifest loads successfully
✓ content.js, background.js, styles/content.css exist
✓ All icon files present
✓ Extension structure validation complete
```

### Chrome Extension Manual Testing - STEP BY STEP
**This is REQUIRED after every code change:**
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked", select repository directory
5. Navigate to `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
6. Verify extension UI elements appear (API key box, buttons on right side)
7. Verify YouTube elements are hidden (comments, sidebar)
8. Test basic UI interactions (click buttons, open/close panels)

### Troubleshooting
- Extension not loading: Check manifest.json syntax with `node -e "JSON.parse(require('fs').readFileSync('manifest.json'))"`
- JavaScript errors: Check browser console on YouTube pages
- UI elements not appearing: Verify CSS selectors and YouTube page structure hasn't changed
- API calls failing: Verify OpenAI API key is valid and network connectivity

## Important Timing and Timeout Information

- **npm init**: ~0.3 seconds - NEVER CANCEL
- **npm install eslint**: 5-10 seconds for dependencies - NEVER CANCEL. Set timeout to 30+ seconds.
- **ESLint validation**: ~1 second - NEVER CANCEL
- **Extension structure validation**: ~1 second - NEVER CANCEL
- **Extension installation in Chrome**: 30 seconds for full manual testing
- **Basic functionality testing**: 2-3 minutes for core features
- **Complete workflow validation**: 5-10 minutes for full testing with API
- **CRITICAL**: Manual testing cannot be skipped or automated - Chrome extension must be loaded and tested in actual browser

## Common Tasks and Expected Outputs

The following are outputs from frequently run commands. Reference them instead of re-running commands to save time.

### Repository Structure
```bash
$ ls -la /home/runner/work/chatwithyoutube/chatwithyoutube
.eslintrc.json       # Legacy ESLint config
.git/                # Git repository
.gitignore          # Git ignore rules
LICENSE             # MIT license
README.md           # Project documentation
background.js       # Extension service worker (2.3KB)
content.js          # Main extension code (27KB+)
cwyt.zip           # Packaged extension (optional)
eslint.config.js   # Modern ESLint config
icons/             # Extension icons directory
manifest.json      # Chrome extension manifest (766 bytes)
node_modules/      # npm dependencies (after npm install)
package.json       # npm configuration
styles/           # CSS directory
```

### Icons Directory
```bash
$ ls -la icons/
icon-original-size.png  # Source icon (21KB)
icon16.png             # 16x16 icon (981 bytes)
icon48.png             # 48x48 icon (2.5KB)  
icon128.png            # 128x128 icon (7.4KB)
```

### Key File Sizes (for reference)
- `content.js`: ~27KB (main extension logic)
- `background.js`: ~2.3KB (service worker)
- `manifest.json`: 766 bytes (extension config)
- `styles/content.css`: ~10KB (UI styles)

### Manifest.json Contents
```json
{
  "manifest_version": 3,
  "name": "Chat With YouTube", 
  "version": "1.3.0",
  "permissions": ["storage", "https://api.openai.com/", "https://api.resend.com/"],
  "host_permissions": ["https://www.youtube.com/*"],
  "content_scripts": [{"matches": ["https://www.youtube.com/*"], "exclude_matches": ["https://www.youtube.com/shorts/*", "https://www.youtube.com/feed/*"]}]
}
```

## Extension Behavior Notes

- Only activates on YouTube video pages (watch?v=)
- Automatically detects and excludes YouTube Shorts (/shorts/)
- Modifies YouTube page by hiding comments, chat, and sidebar
- Requires OpenAI API key for translation functionality
- Uses Chrome storage API for phrase persistence
- All UI elements use 'yll-' prefix to avoid conflicts

## Common Editing Patterns

When modifying the extension:
- Always test in Chrome after JavaScript changes
- CSS changes affect fixed-position UI elements
- Content script permissions are restricted - use chrome.* APIs through background script when needed
- Translation functionality depends on OpenAI API availability
- Extension state persists across YouTube page navigation within same tab