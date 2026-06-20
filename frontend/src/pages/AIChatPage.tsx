import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertTriangle, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const STARTER_QUERIES = [
  { title: 'Eczema Care', subtitle: 'Remedies for eczema', prompt: 'What are the best home remedies and care tips for eczema?' },
  { title: 'Acne vs Rosacea', subtitle: 'Acne vs Rosacea comparison', prompt: 'What is the difference between acne and rosacea? How can I tell which one I have?' },
  { title: 'Allergy Triggers', subtitle: 'Food allergy common symptoms', prompt: 'What are the most common food allergy symptoms and triggers I should watch out for?' },
  { title: 'Pollen Response', subtitle: 'Immediate action for severe pollen reaction', prompt: 'What immediate steps should I take if I have a severe pollen allergy reaction?' },
];

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiChat = async (userMessage: string): Promise<string> => {
    try {
      // Try using the backend's Gemini integration
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.reply || data.response || 'I apologize, I could not generate a response.';
      }
      // Backend returned an error (e.g. 503 quota exceeded) — use local fallback
      console.warn(`[AllerCheck AI] Backend /chat returned ${response.status}, using local fallback.`);
    } catch {
      // Backend unreachable — use local fallback
      console.warn('[AllerCheck AI] Backend unreachable, using local fallback.');
    }

    // Fallback: Smart rule-based response
    return generateFallbackResponse(userMessage);
  };

  const generateFallbackResponse = (message: string): string => {
    const lower = message.toLowerCase();
    
    if (lower.includes('eczema')) {
      return `**Eczema (Atopic Dermatitis) Care:**

• **Moisturize daily** — use fragrance-free creams or ointments, especially after bathing
• **Avoid triggers** — common triggers include soaps, detergents, sweat, and synthetic fabrics
• **Lukewarm baths** — hot water can dry out and irritate the skin
• **Gentle skincare** — use hypoallergenic, fragrance-free products only
• **Track flare-ups** — keep a journal to identify personal triggers

**When to see a doctor:** If your skin becomes infected (oozing, yellow crust), or symptoms significantly impact your quality of life.

⚕️ *This is educational information only, not a medical diagnosis. Please consult a dermatologist for personalized treatment.*`;
    }

    if (lower.includes('acne') && lower.includes('rosacea')) {
      return `**Acne vs Rosacea:**

| Feature | Acne | Rosacea |
|---|---|---|
| Age | Teens to adults | Usually 30+ |
| Location | Face, back, chest | Central face only |
| Blackheads | Yes | No |
| Redness | Around pimples | Persistent facial flush |
| Triggers | Hormones, oil | Sun, spice, alcohol |

**Key difference:** Rosacea never has blackheads/whiteheads and causes persistent redness and visible blood vessels.

⚕️ *Always consult a dermatologist for accurate diagnosis.*`;
    }

    if (lower.includes('allergy') || lower.includes('allergi')) {
      return `**Allergy Overview:**

Common allergy types include:
• **Food allergies** — nuts, shellfish, dairy, wheat
• **Skin contact allergies** — latex, fragrances, metals (nickel)
• **Environmental** — pollen, dust mites, pet dander
• **Drug allergies** — penicillin, aspirin, sulfa drugs

**Common symptoms across types:**
• Hives or skin rash
• Sneezing and runny nose
• Itchy, watery eyes
• Swelling of face or throat

**Seek immediate help if:** throat swelling, difficulty breathing, or severe rash (anaphylaxis signs).

⚕️ *For proper allergy testing, visit an allergist.*`;
    }

    if (lower.includes('pollen')) {
      return `**Pollen Allergy (Hay Fever) — Immediate Steps:**

If you're having a severe reaction:
1. **Move indoors** immediately
2. **Shower and change clothes** to remove pollen
3. **Take antihistamines** (OTC, non-drowsy versions)
4. **Keep windows closed**, use air conditioning
5. **Use saline nasal rinse** to flush out pollen

**Prevention tips:**
• Check daily pollen count (weather apps)
• Wear sunglasses outdoors
• Avoid outdoor activity on high-pollen mornings

🚨 **If breathing is difficult** — seek emergency care immediately.

⚕️ *Consider seeing an allergist for long-term immunotherapy options.*`;
    }

    return `Thank you for your question about **"${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"**

I'm AllerCheck AI, specialized in skin conditions and allergy information. Here's what I can help with:

• **Skin conditions** — Acne, Eczema, Psoriasis, Rosacea, and more
• **Allergy types** — Food, Skin contact, Pollen, Dust, Drug allergies
• **Symptoms** — Identifying and understanding symptoms
• **Home care** — Safe non-prescription care routines
• **When to see a doctor** — Red flags and urgent signs

Could you be more specific about your concern? For example: *"What causes eczema flare-ups?"* or *"How do I know if I have a dust allergy?"*

⚕️ *AllerCheck AI provides educational information only. Always consult a healthcare professional for medical advice.*`;
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callGeminiChat(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '&bull; ')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="text-xs text-amber-400 font-semibold tracking-widest uppercase mb-1">Conversational AI</div>
        <h1 className="text-3xl font-bold text-white mb-1">AI Companion Chat</h1>
        <p className="text-slate-400 text-sm">Ask about skin rashes, allergen triggers, symptoms, or care routines.</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col glass rounded-2xl border border-white/5 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Consult with AllerCheck AI</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                Type a prompt below to evaluate skin rashes, potential allergies, symptoms, triggers, and clinical preventative regimens.
              </p>

              {/* Advisory */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-left max-w-sm w-full">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Advisory Warning</div>
                    <p className="text-xs text-slate-400">
                      This system provides early-stage nutritional, environmental, and skin allergen screening support. It is not a replacement for formal doctor consultations, diagnoses, or medication.
                    </p>
                  </div>
                </div>
              </div>

              {/* Starter Queries */}
              <div className="w-full max-w-sm">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-3 h-3" />
                  Suggested Starter Queries
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STARTER_QUERIES.map((q) => (
                    <button
                      key={q.title}
                      onClick={() => sendMessage(q.prompt)}
                      className="flex flex-col items-start p-3 glass border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 rounded-xl transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">{q.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{q.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-500/20">
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'chat-bubble-user text-white rounded-br-sm'
                    : 'chat-bubble-ai text-slate-200 rounded-bl-sm'
                }`}
              >
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-600'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-amber-500/20">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="chat-bubble-ai rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about skin rashes, allergen triggers, or home remedies..."
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/40 transition-all resize-none scrollbar-thin"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all flex-shrink-0 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line · Educational AI only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
