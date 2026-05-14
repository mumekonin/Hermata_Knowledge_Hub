const AI_API_URL = 'https://hermata-knowledge-hub.onrender.com/ai/chat'; 

// ── Language strings ────────────────────────────────
const LANG = {
  en: {
    welcome:     "Hello! I'm your Hermata library assistant. How can I help you today?",
    placeholder: "Ask a question...",
    error:       "Sorry, I couldn't connect. Please try again.",
  },
  am: {
    welcome:     "ሰላም! እኔ የሄርማታ የቤተ-መጽሐፍት ረዳትዎ ነኝ። ዛሬ እንዴት ልርዳዎ?",
    placeholder: "ጥያቄ ይጠይቁ...",
    error:       "ይቅርታ፣ ግንኙነት አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  },
  om: {
    welcome:     "Akkam! Ana gargaaraa mana kitaabaa Hermata keessan. Har'a akkamitti si gargaaruu danda'a?",
    placeholder: "Gaaffii gaafadhu...",
    error:       "Dhiifama, walqunnamtii hin taane. Irra deebi'ii yaalii godhi.",
  },
};

//  State 
let currentLang = 'en';
let isLoading   = false;

//  Elements 
const launcher       = document.getElementById('ai-chat-launcher');
const chatWindow     = document.getElementById('ai-chat-window');
const closeBtn       = document.getElementById('close-chat');
const sendBtn        = document.getElementById('ai-send-btn');
const input          = document.getElementById('ai-input');
const messageArea    = document.getElementById('ai-chat-messages');
const welcomeMessage = document.getElementById('welcome-message');
const langButtons    = document.querySelectorAll('.lang-btn');

//  Open / close 
launcher.addEventListener('click', () => {
  chatWindow.classList.toggle('hidden');
  if (!chatWindow.classList.contains('hidden')) {
    input.focus();
  }
});

closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

//  Language switch 
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;

    // Update active button style
    langButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update welcome message and placeholder
    welcomeMessage.textContent = LANG[currentLang].welcome;
    input.placeholder          = LANG[currentLang].placeholder;
  });
});

//  Send message 
async function sendMessage() {
  const text = input.value.trim();
  if (!text || isLoading) return;

  // Show user message
  addMessage(text, 'user-msg');
  input.value = '';

  // Show typing indicator
  const typingEl  = addTypingIndicator();
  isLoading       = true;
  sendBtn.disabled = true;

  try {
    const response = await fetch(AI_API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: text, lang: currentLang }),
    });

    if (!response.ok) throw new Error('Server error');

    const data = await response.json();
    typingEl.remove();
    addMessage(data.answer, 'ai-msg');

  } catch (error) {
    typingEl.remove();
    addMessage(LANG[currentLang].error, 'error-msg');

  } finally {
    isLoading        = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

//  Helpers 
function addMessage(text, className) {
  const div       = document.createElement('div');
  div.className   = `message ${className}`;
  div.textContent = text;
  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;
  return div;
}

function addTypingIndicator() {
  const div     = document.createElement('div');
  div.className = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;
  return div;
}

//  Events 
sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) sendMessage();
});