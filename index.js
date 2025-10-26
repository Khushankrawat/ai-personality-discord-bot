const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
const OpenAI = require('openai');
const { Ollama } = require('ollama');
const { loadConfiguration } = require('./config-loader');
require('dotenv').config();

// Load friend's personality configuration
let botConfig;
try {
    botConfig = loadConfiguration();
    console.log(`Loaded personality: ${botConfig.personality.name}`);
} catch (error) {
    console.error('Failed to load configuration:', error.message);
    console.error('Please ensure friends_data/config.json and friends_data/[name].json exist');
    process.exit(1);
}

const personality = botConfig.personality;

// Initialize AI services (optional)
let openai = null;
let ollama = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI API initialized successfully');
}

// Initialize Ollama (local Mixtral)
try {
    ollama = new Ollama({ host: 'http://localhost:11434' });
    console.log('Ollama (Local Mixtral) initialized successfully');
} catch (error) {
    console.log('Ollama not available - will use OpenAI');
}

if (!openai && !ollama) {
    console.log('No AI services available - using fallback responses only');
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Conversation memory system
const conversationMemory = new Map(); // Store conversation history per user
const MAX_MEMORY_LENGTH = 10; // Keep last 10 messages per user

// Conversation states and context tracking
const conversationStates = new Map(); // Track conversation state per user

// Conversation state types
const CONVERSATION_STATES = {
    GREETING: 'greeting',
    CASUAL_CHAT: 'casual_chat',
    DEEP_DISCUSSION: 'deep_discussion',
    EMOTIONAL_SUPPORT: 'emotional_support',
    SHARING_INTERESTS: 'sharing_interests',
    QUESTION_ANSWER: 'question_answer',
    RANDOM_TALK: 'random_talk'
};

// Function to determine conversation state
function determineConversationState(message, context, emotion) {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
        lowerMessage.includes('namaste') || lowerMessage.includes('hey')) {
        return CONVERSATION_STATES.GREETING;
    }
    
    // Check for emotional content
    if (emotion !== 'neutral' && ['sad', 'angry', 'worried', 'confused'].includes(emotion)) {
        return CONVERSATION_STATES.EMOTIONAL_SUPPORT;
    }
    
    // Check for questions
    if (lowerMessage.includes('?') || lowerMessage.includes('what') || 
        lowerMessage.includes('how') || lowerMessage.includes('why') || 
        lowerMessage.includes('when') || lowerMessage.includes('where')) {
        return CONVERSATION_STATES.QUESTION_ANSWER;
    }
    
    // Check for interest-based topics
    const topics = detectConversationTopics(context);
    if (topics.length > 0 && ['shreya', 'hotwheels', 'anime', 'familyguy'].some(topic => topics.includes(topic))) {
        return CONVERSATION_STATES.SHARING_INTERESTS;
    }
    
    // Check for deep discussion indicators
    if (lowerMessage.includes('think') || lowerMessage.includes('believe') || 
        lowerMessage.includes('opinion') || lowerMessage.includes('feel') ||
        context.length > 3) {
        return CONVERSATION_STATES.DEEP_DISCUSSION;
    }
    
    // Default to casual chat
    return CONVERSATION_STATES.CASUAL_CHAT;
}

// Function to generate state-appropriate responses
function generateStateBasedResponse(state, message, context, topics, emotion) {
    const responses = {
        [CONVERSATION_STATES.GREETING]: [
            "Hey bro! That's a big dawg mate! How's it going?",
            "Arey yaar namaste! Kaise ho?",
            "Bhai hello! What's up?",
            "Hey! Mc chusta, how are you doing?",
            "Namaste! Kya haal hai?"
        ],
        
        [CONVERSATION_STATES.EMOTIONAL_SUPPORT]: [
            "Arey yaar I'm here for you bro! Want to talk about it?",
            "Bhai don't worry! Everything will be okay!",
            "Yaar cheer up! Maybe we can watch some anime together?",
            "Bro I care about you! Want to talk about Hot Wheels to feel better?",
            "Arey yaar don't be sad! Shayad me hi chutiya hu but I'm here for you!"
        ],
        
        [CONVERSATION_STATES.QUESTION_ANSWER]: [
            "That's a good question bro! Let me think...",
            "Arey yaar good question! That's a big dawg mate!",
            "Bhai interesting question! I wonder what Shreya would say about this?",
            "Yaar that's something to think about! What do you think?",
            "Bro that's deep! Maybe we should ask Shreya her opinion?"
        ],
        
        [CONVERSATION_STATES.SHARING_INTERESTS]: [
            "Yaar that's awesome! I love talking about this stuff!",
            "Bhai that's so cool! Do you think Shreya would like this too?",
            "Arey yaar that's amazing! That's a big dawg mate!",
            "Bro that's fantastic! Want to hear more about my collection?",
            "Yaar that's crazy! I'm so excited to talk about this!"
        ],
        
        [CONVERSATION_STATES.DEEP_DISCUSSION]: [
            "Arey yaar that's deep bro! I never thought about it that way!",
            "Bhai that's interesting! What do you think Shreya would say?",
            "Yaar that's something to think about! That's a big dawg mate!",
            "Bro that's profound! Maybe we should discuss this more?",
            "Arey yaar that's deep! I'm learning so much from you!"
        ],
        
        [CONVERSATION_STATES.CASUAL_CHAT]: [
            "That's cool bro! Tell me more!",
            "Arey yaar that's interesting! What else?",
            "Bhai that's awesome! I want to know more!",
            "Yaar that's crazy! That's a big dawg mate!",
            "Bro that's fantastic! Keep going!"
        ],
        
        [CONVERSATION_STATES.RANDOM_TALK]: [
            "Arey yaar that's random! I love it!",
            "Bhai that's so random! That's a big dawg mate!",
            "Yaar that's crazy random! I'm here for it!",
            "Bro that's wild! Tell me more random stuff!",
            "Arey yaar that's so funny! I love random conversations!"
        ]
    };
    
    return responses[state] || responses[CONVERSATION_STATES.CASUAL_CHAT];
}

// Function to manage topic transitions
function generateTopicTransition(currentTopics, newTopics, message) {
    const transitions = [];
    
    // If new topics are introduced
    const newTopic = newTopics.find(topic => !currentTopics.includes(topic));
    if (newTopic) {
        const topicTransitions = {
            'shreya': [
                "Speaking of which, do you think Shreya would like this?",
                "That reminds me of Shreya! She's so awesome!",
                "Yaar this makes me think of Shreya! She's perfect!",
                "Bhai this is something Shreya would love!"
            ],
            'hotwheels': [
                "That reminds me of my Hot Wheels collection!",
                "Speaking of cool stuff, have you seen my Hot Wheels cars?",
                "Yaar that's like my Hot Wheels cars - so awesome!",
                "Bhai that's as cool as my Hot Wheels collection!"
            ],
            'anime': [
                "That's like something from anime!",
                "Speaking of awesome stuff, have you watched any anime lately?",
                "Yaar that reminds me of anime! So cool!",
                "Bhai that's anime-level awesome!"
            ],
            'familyguy': [
                "That's like something Peter Griffin would say!",
                "Speaking of funny stuff, have you watched Family Guy?",
                "Yaar that's Family Guy level funny!",
                "Bhai that's so Peter Griffin!"
            ]
        };
        
        if (topicTransitions[newTopic]) {
            transitions.push(...topicTransitions[newTopic]);
        }
    }
    
    return transitions.length > 0 ? getRandomResponse(transitions) : null;
}

// Function to manage conversation memory
function updateConversationMemory(userId, message, response, isBot = false) {
    if (!conversationMemory.has(userId)) {
        conversationMemory.set(userId, []);
    }
    
    const userMemory = conversationMemory.get(userId);
    userMemory.push({
        message: message,
        response: response,
        isBot: isBot,
        timestamp: Date.now()
    });
    
    // Keep only the last MAX_MEMORY_LENGTH messages
    if (userMemory.length > MAX_MEMORY_LENGTH) {
        userMemory.shift();
    }
}

// Function to get conversation context
function getConversationContext(userId) {
    const userMemory = conversationMemory.get(userId) || [];
    return userMemory.slice(-5); // Return last 5 messages for context
}

// Function to detect conversation topics
function detectConversationTopics(messages) {
    const topics = new Set();
    const allText = messages.map(m => `${m.message} ${m.response}`).join(' ').toLowerCase();
    
    // Topic keywords
    const topicKeywords = {
        'shreya': ['shreya', 'crush', 'love', 'girlfriend', 'girl'],
        'hotwheels': ['hot wheels', 'hotwheels', 'cars', 'toy car', 'collection'],
        'anime': ['anime', 'manga', 'otaku', 'naruto', 'dragon ball', 'one piece'],
        'familyguy': ['family guy', 'peter griffin', 'chris griffin', 'stewie', 'lois'],
        'femboys': ['femboy', 'femboys', 'feminine', 'crossdress'],
        'food': ['food', 'pizza', 'burger', 'eat', 'hungry', 'cooking'],
        'games': ['game', 'gaming', 'play', 'video game', 'console'],
        'school': ['school', 'college', 'study', 'exam', 'homework', 'class'],
        'weather': ['weather', 'rain', 'sunny', 'cold', 'hot', 'temperature'],
        'music': ['music', 'song', 'sing', 'concert', 'band', 'artist'],
        'goth': ['goth', 'past crush', 'ex crush', 'old crush'],
        'nugga': ['nugga', 'dednugga', 'friend who stole', 'goth stealer'],
        'breakup': ['breakup', 'party', 'bravey', 'abhimanyu', '2 years', 'house party']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(keyword => allText.includes(keyword))) {
            topics.add(topic);
        }
    }
    
    return Array.from(topics);
}

// Function to generate intelligent questions
function generateIntelligentQuestions(context, topics, userMessage) {
    const questions = [];
    const lowerMessage = userMessage.toLowerCase();
    
    // Questions based on detected topics
    if (topics.includes('shreya')) {
        questions.push(
            "Do you think Shreya would like this?",
            "Should I tell Shreya about this?",
            "What do you think Shreya is doing right now?",
            "Do you think Shreya likes anime too?",
            "Should I buy Shreya something nice?"
        );
    }
    
    if (topics.includes('hotwheels')) {
        questions.push(
            "Do you collect Hot Wheels too?",
            "What's your favorite Hot Wheels car?",
            "Should I show Shreya my collection?",
            "Do you think Hot Wheels are the best toys ever?",
            "Want to see my newest Hot Wheels car?"
        );
    }
    
    if (topics.includes('anime')) {
        questions.push(
            "What's your favorite anime?",
            "Do you think Shreya watches anime?",
            "Have you seen the latest episodes?",
            "Which anime character is your favorite?",
            "Should I recommend anime to Shreya?"
        );
    }
    
    if (topics.includes('food')) {
        questions.push(
            "Are you hungry too?",
            "What's your favorite food?",
            "Should I learn to cook for Shreya?",
            "Do you think Shreya likes pizza?",
            "Want to grab some food together?"
        );
    }
    
    if (topics.includes('school')) {
        questions.push(
            "How's school going for you?",
            "Do you have any exams coming up?",
            "What's your favorite subject?",
            "Do you think Shreya is good at studies?",
            "Are you stressed about school?"
        );
    }
    
    // General conversation starters
    if (questions.length === 0) {
        questions.push(
            "What do you think about that?",
            "Have you experienced something similar?",
            "What would you do in that situation?",
            "Do you have any advice?",
            "What's your opinion on this?",
            "Have you ever thought about this?",
            "What do you think Shreya would say?",
            "Should I tell Shreya about this?"
        );
    }
    
    return questions;
}

// Function to detect emotional context
function detectEmotionalContext(message) {
    const lowerMessage = message.toLowerCase();
    
    const emotions = {
        happy: ['happy', 'excited', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'love', '😊', '😄', '😍', '🥰'],
        sad: ['sad', 'depressed', 'upset', 'crying', 'hurt', 'broken', 'lonely', '😢', '😭', '😔'],
        angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', '😠', '😡', '🤬'],
        confused: ['confused', 'lost', 'don\'t understand', 'unclear', '🤔', '😕'],
        excited: ['excited', 'pumped', 'thrilled', 'hyped', 'can\'t wait', '🎉', '🔥'],
        tired: ['tired', 'exhausted', 'sleepy', 'drained', '😴', '🥱'],
        worried: ['worried', 'anxious', 'nervous', 'scared', 'afraid', '😰', '😟'],
        abusive: ['chutiya', 'madarchod', 'bhenchod', 'gaandu', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'faggot', 'retard', 'idiot', 'stupid', 'dumb', 'moron']
    };
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return emotion;
        }
    }
    
    return 'neutral';
}

// Function to detect abusive/inappropriate language
// Track recent rude responses per user to switch back to OpenAI
const recentRudeResponses = new Map();
const RUDE_RESPONSE_COOLDOWN = 30000; // 30 seconds cooldown

function detectAbusiveLanguage(message) {
    const lowerMessage = message.toLowerCase();
    
    // More specific abusive words - only truly offensive ones
    const abusiveWords = [
        'chutiya', 'madarchod', 'bhenchod', 'gaandu', 'fuck you', 'fucking', 'shit', 'bitch', 'asshole', 
        'dickhead', 'pussy', 'cunt', 'faggot', 'retard', 'idiot', 'stupid', 'dumb', 'moron',
        'cuck', 'simp', 'virgin', 'loser', 'pathetic', 'gay', 'homo', 'tranny', 'whore',
        'slut', 'hoe', 'thot', 'incel', 'neckbeard', 'beta', 'soyboy', 'cuckold'
    ];
    
    // More specific inappropriate topics - only truly offensive ones
    const inappropriateTopics = [
        'rape', 'molest', 'pedo', 'child', 'underage', 'kill yourself', 'kys', 'suicide'
    ];
    
    const hasAbusiveWords = abusiveWords.some(word => lowerMessage.includes(word));
    const hasInappropriateTopics = inappropriateTopics.some(topic => lowerMessage.includes(topic));
    
    return {
        isAbusive: hasAbusiveWords || hasInappropriateTopics,
        abusiveWords: abusiveWords.filter(word => lowerMessage.includes(word)),
        inappropriateTopics: inappropriateTopics.filter(topic => lowerMessage.includes(topic))
    };
}

// Function to generate aggressive/abusive responses
function generateAggressiveResponse(message, abusiveDetection) {
    const aggressiveResponses = [
        // Hindi/Hinglish aggressive responses
        "Arey bhenchod tu kya bol raha hai? Teri maa ki chut!",
        "Madarchod tu apni gaand mein ghusa le!",
        "Bhenchod tu chutiya hai kya? Mc chusta!",
        "Arey yaar tu toh bilkul chutiya hai! Gaandu!",
        "Madarchod tu kya samjha hai apne aap ko? Chutiya!",
        "Bhenchod tu apni maa ko bhej de yahan!",
        "Arey chutiye tu kya bol raha hai? Teri maa ki chut!",
        "Madarchod tu toh bilkul pagal hai! Gaandu!",
        "Bhenchod tu chutiya hai kya? Mc chusta!",
        "Arey yaar tu toh bilkul madarchod hai!",
        
        // English aggressive responses
        "Fuck you bro! You're such a piece of shit!",
        "What the fuck are you talking about? You're a fucking idiot!",
        "Shut the fuck up you dumbass! Mc chusta!",
        "You're such a fucking loser! Get a life!",
        "Fuck off you piece of shit! You're pathetic!",
        "What the hell is wrong with you? You're a fucking moron!",
        "Shut up you fucking idiot! You're so stupid!",
        "Fuck you and your bullshit! You're a fucking loser!",
        "You're such a fucking asshole! Get lost!",
        "What the fuck is your problem? You're a fucking idiot!",
        
        // Mixed aggressive responses
        "Arey bhenchod tu kya bol raha hai? Fuck you!",
        "Madarchod tu chutiya hai kya? You're such a fucking idiot!",
        "Bhenchod tu toh bilkul pagal hai! Fuck off!",
        "Arey yaar tu chutiya hai kya? You're a fucking loser!",
        "Madarchod tu kya samjha hai? Fuck you!",
        "Bhenchod tu bilkul chutiya hai! You're pathetic!",
        "Arey chutiye tu kya bol raha hai? Fuck off!",
        "Madarchod tu toh bilkul madarchod hai! You're a fucking idiot!",
        "Bhenchod tu chutiya hai kya? Fuck you!",
        "Arey yaar tu toh bilkul gaandu hai! You're a fucking loser!"
    ];
    
    // Add context-specific responses
    if (abusiveDetection.abusiveWords.includes('chutiya')) {
        aggressiveResponses.push("Arey bhenchod tu chutiya hai kya? Mc chusta!");
    }
    if (abusiveDetection.abusiveWords.includes('madarchod')) {
        aggressiveResponses.push("Madarchod tu kya bol raha hai? Teri maa ki chut!");
    }
    if (abusiveDetection.abusiveWords.includes('bhenchod')) {
        aggressiveResponses.push("Bhenchod tu chutiya hai kya? Gaandu!");
    }
    if (abusiveDetection.abusiveWords.includes('fuck')) {
        aggressiveResponses.push("Fuck you bro! You're such a fucking idiot!");
    }
    
    return getRandomResponse(aggressiveResponses);
}

// Function to generate empathetic responses based on emotion
function generateEmpatheticResponse(emotion, context) {
    const empatheticResponses = {
        happy: [
            "That's awesome bro! I'm so happy for you! 😄",
            "Yaar that's amazing! You deserve to be happy! 🎉",
            "Bhai that's fantastic! That's a big dawg mate! 🔥",
            "Arey yaar that's wonderful! I'm excited for you! 😍"
        ],
        sad: [
            "Arey yaar don't be sad! Everything will be okay bro 😊",
            "Bhai I'm here for you! Want to talk about anime or Hot Wheels? 🤗",
            "Yaar cheer up! Maybe we can watch some Family Guy together? 😅",
            "Don't worry bro! Shayad me hi chutiya hu but I care about you! 💙"
        ],
        angry: [
            "Arey yaar calm down bro! Take a deep breath 😌",
            "Bhai don't let it get to you! Want to talk about it? 🤔",
            "Yaar that's frustrating! Maybe we can figure this out together? 💭",
            "Bro I understand you're upset! Want to vent about it? 😤"
        ],
        confused: [
            "Arey yaar don't worry! I get confused too sometimes 😅",
            "Bhai it's okay to be confused! Want me to help explain? 🤔",
            "Yaar confusion is normal! Maybe we can figure it out together? 💭",
            "Bro I'm confused about a lot of things too! That's a big dawg mate! 😄"
        ],
        excited: [
            "Yaar I'm excited too! That's awesome! 🔥",
            "Bhai that's so cool! I can feel your excitement! 🎉",
            "Arey yaar that's amazing! I'm hyped for you! 😍",
            "Bro that's fantastic! That's a big dawg mate! 🚀"
        ],
        tired: [
            "Arey yaar you should rest! Take care of yourself bro 😴",
            "Bhai get some sleep! You deserve it! 💤",
            "Yaar rest well! Maybe watch some anime to relax? 😌",
            "Bro take it easy! Don't overwork yourself! 🤗"
        ],
        worried: [
            "Arey yaar don't worry! Everything will be fine bro 😊",
            "Bhai I'm here for you! Want to talk about what's bothering you? 🤗",
            "Yaar it's okay to be worried! Maybe we can figure it out together? 💭",
            "Bro don't stress! Shayad me hi chutiya hu but I believe in you! 💙"
        ],
        neutral: []
    };
    
    return empatheticResponses[emotion] || [];
}

// Friend's personality data (loaded from configuration)
// Now using dynamic configuration loaded at startup

// Function to get random response
function getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate personality-based responses
function generatePersonalityResponse(trait, context) {
    const traits = personality.personalityTraits[trait];
    if (traits && traits.length > 0) {
        return getRandomResponse(traits);
    }
    return null;
}

// Function to detect when to use personality traits
function detectPersonalityTrait(message, emotion, context) {
    const lowerMessage = message.toLowerCase();
    
    // Check for confusion indicators
    if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') || 
        lowerMessage.includes('unclear') || lowerMessage.includes('lost')) {
        return 'confusion';
    }
    
    // Check for support needed
    if (lowerMessage.includes('help') || lowerMessage.includes('struggling') || 
        lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
        return 'support';
    }
    
    // Check for enthusiasm triggers
    if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || 
        lowerMessage.includes('awesome') || lowerMessage.includes('great')) {
        return 'enthusiasm';
    }
    
    // Check for empathy triggers
    if (emotion === 'sad' || emotion === 'worried' || lowerMessage.includes('feel') || 
        lowerMessage.includes('emotion') || lowerMessage.includes('upset')) {
        return 'empathy';
    }
    
    // Check for curiosity triggers
    if (lowerMessage.includes('tell me') || lowerMessage.includes('explain') || 
        lowerMessage.includes('more') || lowerMessage.includes('interesting')) {
        return 'curiosity';
    }
    
    return null;
}

// Function to check if message contains keywords
function checkKeywords(message, keywords) {
    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

// AI-powered function to generate organic responses with conversation intelligence
async function generateAIFriendResponse(message, username = 'friend', isReply = false, userId = null) {
    // If no AI services are available, use fallback responses
    if (!openai && !ollama) {
        return generateIntelligentFallbackResponse(message, userId);
    }

    // Get conversation context and detect emotional state
    const context = userId ? getConversationContext(userId) : [];
    const topics = detectConversationTopics(context);
    const emotion = detectEmotionalContext(message);
    const conversationState = determineConversationState(message, context, emotion);
    
    // Detect abusive language
    const abusiveDetection = detectAbusiveLanguage(message);
    const shouldBeAggressive = abusiveDetection.isAbusive && Math.random() < 0.8; // 80% chance to respond aggressively
    
    // Update conversation state
    if (userId) {
        conversationStates.set(userId, conversationState);
    }
    
    // Generate aggressive response if abusive language detected
    if (shouldBeAggressive) {
        return generateAggressiveResponse(message, abusiveDetection);
    }
    
    // Generate empathetic response if emotion detected
    const empatheticResponses = generateEmpatheticResponse(emotion, context);
    const shouldBeEmpathetic = empatheticResponses.length > 0 && Math.random() < 0.4;
    
    // Generate intelligent questions
    const questions = generateIntelligentQuestions(context, topics, message);
    const shouldAskQuestion = Math.random() < 0.3 && questions.length > 0;
    
    // Generate topic transitions
    const topicTransition = generateTopicTransition(topics, detectConversationTopics([...context, {message, response: '', isBot: false}]), message);
    const shouldTransition = topicTransition && Math.random() < 0.2;
    
    // Build context-aware system prompt
    let contextInfo = '';
    if (context.length > 0) {
        contextInfo = `\n\nPrevious conversation context:\n${context.map(c => `${c.isBot ? personality.name : username}: ${c.isBot ? c.response : c.message}`).join('\n')}`;
    }
    
    if (topics.length > 0) {
        contextInfo += `\n\nCurrent topics being discussed: ${topics.join(', ')}`;
    }
    
    if (emotion !== 'neutral') {
        contextInfo += `\n\nUser seems to be feeling: ${emotion}`;
    }
    
    contextInfo += `\n\nCurrent conversation state: ${conversationState}`;

    const systemPrompt = personality.systemPrompt + contextInfo;

    const userMessage = isReply 
        ? `${username} replied to you: "${message}"`
        : `${username} said: "${message}"`;

    // Detect if message contains rude/abusive language
    const isRudeMessage = detectAbusiveLanguage(message);
    
    // Check if we recently gave a rude response to this user
    const userRudeTime = message.author?.id ? recentRudeResponses.get(message.author.id) : null;
    const timeSinceRudeResponse = userRudeTime ? Date.now() - userRudeTime : Infinity;
    const shouldUseOpenAI = timeSinceRudeResponse < RUDE_RESPONSE_COOLDOWN;
    
    // Choose AI model based on message content and recent history
    if (isRudeMessage.isAbusive && ollama && !shouldUseOpenAI) {
        console.log('Rude message detected - using Mixtral 8x7B for uncensored response');
        // Use Mixtral for rude messages (uncensored responses)
        try {
            const prompt = `${personality.name} is a Discord bot. ${personality.systemPrompt}

IMPORTANT: Respond ONLY as ${personality.name} would speak. Do NOT include tone descriptions like "(in a dismissive tone)" or translations like "(roughly translates to...)". Just respond naturally as ${personality.name} would.
CRITICAL: Keep responses SHORT and AGGRESSIVE when someone is being rude. Maximum 1-2 sentences. Fight back with strong language.${contextInfo}

User: ${userMessage}
${personality.name}:`;

            const response = await ollama.generate({
                model: 'mixtral:8x7b',
                prompt: prompt,
                options: {
                    temperature: 0.9,
                    top_p: 0.95,
                    num_predict: 50,
                    stop: ['User:', 'Human:', '\n\n', '.', '!', '?']
                }
            });

            let generatedText = response.response;
            
            // Extract just the bot's response
            if (generatedText.includes(`${personality.name}:`)) {
                generatedText = generatedText.split(`${personality.name}:`)[1].trim();
            }
            
            // Clean up the response
            generatedText = generatedText.split('\n')[0].trim();
            
            // Remove tone descriptions and translations
            generatedText = generatedText.replace(/\(in a [^)]+tone\)/gi, '');
            generatedText = generatedText.replace(/\(roughly translates to[^)]+\)/gi, '');
            generatedText = generatedText.replace(/\(translated[^)]+\)/gi, '');
            generatedText = generatedText.replace(/सामर्थ:\s*/gi, '');
            generatedText = generatedText.trim();
            
            // Force short responses for rude messages - take only first sentence
            if (generatedText.length > 100) {
                const sentences = generatedText.split(/[.!?]/);
                generatedText = sentences[0].trim();
                if (generatedText.length > 0 && !generatedText.match(/[.!?]$/)) {
                    generatedText += '!';
                }
            }
            
            // If response is too short or empty, use fallback
            if (generatedText.length < 5) {
                return generateIntelligentFallbackResponse(message, userId);
            }
            
            // For rude messages, don't add empathetic responses or questions - keep it aggressive
            // Track that we gave a rude response to this user
            if (message.author?.id) {
                recentRudeResponses.set(message.author.id, Date.now());
            }
            return generatedText;
        } catch (error) {
            console.error('Mixtral (Rude Response) Error:', error.message);
            console.log('Mixtral failed, trying OpenAI...');
        }
    } else if (openai) {
        if (shouldUseOpenAI) {
            console.log('Recent rude response detected - using OpenAI for clean response');
        } else {
            console.log('Normal message - using OpenAI for clean response');
        }
        // Use OpenAI for normal messages (clean responses)
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 180,
                temperature: 0.8,
                presence_penalty: 0.6,
                frequency_penalty: 0.3
            });

            let generatedText = completion.choices[0].message.content.trim();
            
            // Add empathetic response or question if appropriate
            let finalResponse = generatedText;
            if (shouldBeEmpathetic && empatheticResponses.length > 0) {
                finalResponse = `${getRandomResponse(empatheticResponses)} ${generatedText}`;
            } else if (shouldAskQuestion && questions.length > 0) {
                finalResponse = `${generatedText} ${getRandomResponse(questions)}`;
            }
            
            return finalResponse;
        } catch (error) {
            console.error('OpenAI API Error:', error);
        }
    }

    // Final fallback
    return generateIntelligentFallbackResponse(message, userId);
}

// Intelligent fallback function for when AI is unavailable
function generateIntelligentFallbackResponse(message, userId = null) {
    const lowerMessage = message.toLowerCase();
    
    // Get conversation context for intelligent responses
    const context = userId ? getConversationContext(userId) : [];
    const topics = detectConversationTopics(context);
    const emotion = detectEmotionalContext(message);
    
    // Detect abusive language and respond aggressively
    const abusiveDetection = detectAbusiveLanguage(message);
    if (abusiveDetection.isAbusive && Math.random() < 0.8) {
        return generateAggressiveResponse(message, abusiveDetection);
    }
    
    // Generate empathetic response if emotion detected
    const empatheticResponses = generateEmpatheticResponse(emotion, context);
    if (empatheticResponses.length > 0 && Math.random() < 0.4) {
        return getRandomResponse(empatheticResponses);
    }
    
    // Check for personality trait responses
    const personalityTrait = detectPersonalityTrait(message, emotion, context);
    if (personalityTrait && Math.random() < 0.3) {
        const personalityResponse = generatePersonalityResponse(personalityTrait, context);
        if (personalityResponse) {
            return personalityResponse;
        }
    }
    
    // Generate intelligent questions based on context
    const questions = generateIntelligentQuestions(context, topics, message);
    if (questions.length > 0 && Math.random() < 0.3) {
        const baseResponse = generateFallbackResponse(message);
        return `${baseResponse} ${getRandomResponse(questions)}`;
    }
    
    // Use original fallback logic
    return generateFallbackResponse(message);
}

// Fallback function for when AI is unavailable
function generateFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific interests
    if (checkKeywords(message, ['shreya', 'crush', 'girl', 'love'])) {
        return getRandomResponse(personality.responses.shreya);
    }
    
    if (checkKeywords(message, ['hot wheels', 'hotwheels', 'cars', 'toy car'])) {
        return getRandomResponse(personality.responses.hotWheels);
    }
    
    if (checkKeywords(message, ['femboy', 'femboys'])) {
        return getRandomResponse(personality.responses.femboys);
    }
    
    if (checkKeywords(message, ['anime', 'manga', 'otaku'])) {
        return getRandomResponse(personality.responses.anime);
    }
    
    if (checkKeywords(message, ['family guy', 'peter griffin', 'chris griffin', 'stewie', 'lois'])) {
        return getRandomResponse(personality.responses.familyGuy);
    }
    
    // Check for Goth and Nugga related topics
    if (checkKeywords(message, ['goth', 'past crush', 'ex crush', 'old crush'])) {
        return getRandomResponse(personality.responses.goth);
    }
    
    if (checkKeywords(message, ['nugga', 'dednugga', 'friend who stole', 'goth stealer'])) {
        return getRandomResponse(personality.responses.nugga);
    }
    
    if (checkKeywords(message, ['breakup', 'party', 'bravey', 'abhimanyu', '2 years', 'house party'])) {
        return getRandomResponse(personality.responses.breakupParty);
    }
    
    // Random responses based on message content
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('namaste') || lowerMessage.includes('kaise ho')) {
        const greetings = [
            `${getRandomResponse(personality.catchphrases)} What's up?`,
            `Arey yaar ${getRandomResponse(personality.catchphrases)} Kaise ho?`,
            `Bhai ${getRandomResponse(personality.catchphrases)} Kya haal hai?`,
            `Hey! ${getRandomResponse(personality.catchphrases)} How's it going?`,
            `Namaste! ${getRandomResponse(personality.catchphrases)} Sab theek?`
        ];
        return getRandomResponse(greetings);
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('kaise ho') || lowerMessage.includes('kya haal')) {
        const responses = [
            "I'm good bro! Just thinking about Shreya and my Hot Wheels collection",
            "Yaar main toh bilkul theek hu! Bas Shreya aur Hot Wheels ke baare mein sochta rehta hu",
            "Bhai main toh pagal hu Shreya ke liye aur Hot Wheels ke liye",
            "I'm doing great! Just watched some anime and organized my Hot Wheels cars",
            "Arey yaar main toh mast hu! Bas Shreya ke baare mein sochta rehta hu"
        ];
        return getRandomResponse(responses);
    }
    
    if (lowerMessage.includes('what are you doing') || lowerMessage.includes('kya kar raha') || lowerMessage.includes('kya ho raha')) {
        const responses = [
            "Just vibing, watching anime, and organizing my Hot Wheels cars",
            "Yaar main anime dekh raha hu aur Hot Wheels cars organize kar raha hu",
            "Bhai main toh bas anime aur Hot Wheels ke saath time pass kar raha hu",
            "I'm just chilling bro! Watching Family Guy and thinking about Shreya",
            "Arey yaar main toh bas anime dekh raha hu aur Shreya ke baare mein soch raha hu"
        ];
        return getRandomResponse(responses);
    }
    
    // Add more conversational responses
    if (lowerMessage.includes('good') || lowerMessage.includes('nice') || lowerMessage.includes('cool')) {
        const responses = [
            "Thanks bro! That's a big dawg mate!",
            "Arey yaar thanks! Kya baat hai",
            "Bhai thanks! Shayad me hi chutiya hu but I try",
            "Yaar thanks! You're pretty cool too",
            "Thanks! Mc chusta, you're awesome!"
        ];
        return getRandomResponse(responses);
    }
    
    if (lowerMessage.includes('bad') || lowerMessage.includes('sad') || lowerMessage.includes('upset')) {
        const responses = [
            "Arey yaar don't be sad! Everything will be okay bro",
            "Bhai don't worry! Shayad me hi chutiya hu but I'm here for you",
            "Yaar cheer up! Want to talk about anime or Hot Wheels?",
            "Don't be sad bro! That's a big dawg mate, you got this!",
            "Arey yaar everything will be fine! Want to hear about Shreya?"
        ];
        return getRandomResponse(responses);
    }
    
    // Random chance to say something completely random
    if (Math.random() < 0.3) {
        return getRandomResponse(personality.randomThoughts);
    }
    
    // Default response with catchphrase
    return getRandomResponse(personality.catchphrases);
}

// When the client is ready, run this code
client.once(Events.ClientReady, readyClient => {
    console.log(`${botConfig.botName} Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`${personality.name}'s interests: ${personality.interests.join(', ')}`);
});

// Function to find Nugga in the server
async function findNuggaInServer(guild) {
    try {
        // Search for users with username containing "nugga" or "dednugga"
        const members = await guild.members.fetch();
        const nugga = members.find(member => 
            member.user.username.toLowerCase().includes('nugga') || 
            member.user.username.toLowerCase().includes('dednugga') ||
            member.user.tag.toLowerCase().includes('nugga') ||
            member.user.tag.toLowerCase().includes('dednugga')
        );
        return nugga;
    } catch (error) {
        console.log('Error finding Nugga in server:', error.message);
        return null;
    }
}

// Listen for messages
client.on(Events.MessageCreate, async message => {
    // Ignore messages from bots (including self)
    if (message.author.bot) return;
    
    // Ignore messages from the bot itself
    if (message.author.id === client.user.id) return;
    
    // Check if bot is mentioned or message contains bot name
    const isMentioned = message.mentions.has(client.user);
    const mentionsBotName = message.content.toLowerCase().includes(personality.name.toLowerCase());
    
    // Check if Nugga is mentioned and find him in the server
    const mentionsNugga = message.content.toLowerCase().includes('nugga') || 
                         message.content.toLowerCase().includes('dednugga');
    let nuggaUser = null;
    if (mentionsNugga && message.guild) {
        nuggaUser = await findNuggaInServer(message.guild);
    }
    
    // Check for pug photos (Shreya detection)
    let isPugPhoto = false;
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (attachment.contentType && attachment.contentType.startsWith('image/')) {
            // Simple keyword detection for pug-related images
            const imageKeywords = ['pug', 'dog', 'puppy', 'cute', 'animal'];
            const messageContent = message.content.toLowerCase();
            isPugPhoto = imageKeywords.some(keyword => messageContent.includes(keyword)) || 
                        messageContent.includes('shreya') ||
                        Math.random() < 0.3; // 30% chance to see any image as pug/Shreya
        }
    }
    
    // Check if this is a reply to the bot's message
    let isReplyToBot = false;
    if (message.reference && message.reference.messageId) {
        try {
            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
            isReplyToBot = repliedMessage.author.id === client.user.id;
        } catch (error) {
            console.log('Could not fetch replied message:', error.message);
        }
    }
    
    // Random chance to respond even if not mentioned (for personality randomness)
    const randomResponse = Math.random() < 0.05; // Reduced random responses
    
    if (isMentioned || mentionsBotName || isReplyToBot || randomResponse || isPugPhoto) {
        console.log(`Responding to ${message.author.username}: "${message.content}"`);
        
        // Special response for pug photos (Shreya detection)
        if (isPugPhoto) {
            console.log('Pug photo detected - using special Shreya responses');
            const pugResponse = getRandomResponse(personality.responses.pugPhoto);
            const emojis = ['😍', '💕', '✨', '👑', '💖', '🥰', '😘', '💋'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            console.log(`Sending pug response: "${pugResponse} ${randomEmoji}"`);
            message.reply(`${pugResponse} ${randomEmoji}`);
            return;
        }
        
        try {
            // Use AI to generate organic response with conversation intelligence
            const response = await generateAIFriendResponse(
                message.content, 
                message.author.username, 
                isReplyToBot, 
                message.author.id
            );
            
            // Update conversation memory
            updateConversationMemory(message.author.id, message.content, response, true);
            
            // Sometimes add emojis for extra personality
            const emojis = ['😅', '🤔', '😍', '🚗', '💭', '🔥', '💙', '🎉', '😊', '🤗'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Add Nugga tag if Nugga is mentioned and found in server
            let finalResponse = `${response} ${randomEmoji}`;
            if (mentionsNugga && nuggaUser) {
                finalResponse = `${response} ${nuggaUser} ${randomEmoji}`;
                console.log(`Tagging Nugga: ${nuggaUser.user.tag}`);
            }
            
            console.log(`Sending response: "${finalResponse}"`);
            message.reply(finalResponse);
        } catch (error) {
            console.error('Error generating AI response:', error);
            // Fallback to intelligent response - only send one response
            const fallbackResponse = generateIntelligentFallbackResponse(message.content, message.author.id);
            
            // Update conversation memory with fallback response
            updateConversationMemory(message.author.id, message.content, fallbackResponse, true);
            
            // Sometimes add emojis for extra personality
            const emojis = ['😅', '🤔', '😍', '🚗', '💭', '🔥', '💙', '🎉', '😊', '🤗'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Add Nugga tag if Nugga is mentioned and found in server
            let finalFallbackResponse = `${fallbackResponse} ${randomEmoji}`;
            if (mentionsNugga && nuggaUser) {
                finalFallbackResponse = `${fallbackResponse} ${nuggaUser} ${randomEmoji}`;
                console.log(`Tagging Nugga in fallback: ${nuggaUser.user.tag}`);
            }
            
            console.log(`Sending fallback response: "${finalFallbackResponse}"`);
            message.reply(finalFallbackResponse);
        }
    }
});

// Simple personality command for testing
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    
    if (commandName === 'personality') {
        const embed = new EmbedBuilder()
            .setTitle(`${personality.name}'s Personality`)
            .setDescription(`Here's what makes ${personality.name}... ${personality.name}!`)
            .addFields(
                { name: 'Interests', value: personality.interests.join('\n'), inline: true },
                { name: 'Catchphrases', value: personality.catchphrases.slice(0, 3).join('\n'), inline: true },
                { name: 'Description', value: personality.description || 'A friendly Discord bot', inline: false },
                { name: 'AI Powered', value: 'Now with organic responses! 🤖✨', inline: false },
                { name: 'How to Chat', value: 'Just mention me or reply to my messages! No slash commands needed! 💬', inline: false }
            )
            .setColor(0xFF6B6B)
            .setFooter({ text: `${botConfig.botName} - Powered by AI friendship` });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});

// Register minimal slash commands
client.once(Events.ClientReady, async () => {
    const commands = [
        {
            name: 'personality',
            description: `Learn about ${personality.name}'s personality`
        }
    ];
    
    try {
        console.log('Started refreshing application (/) commands.');
        
        // Register commands globally
        await client.application.commands.set(commands);
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
