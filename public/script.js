// Plant Companion - Complete Interactive System

document.addEventListener('DOMContentLoaded', function() {
    console.log('Plant Companion initializing...');
    
    // Get elements
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Navigation system
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active from all buttons
            navButtons.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked button
            this.classList.add('active');
            
            // Show/hide pages
            const targetPage = this.getAttribute('data-page');
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            
            const targetPageElement = document.getElementById(targetPage + '-page');
            if (targetPageElement) {
                targetPageElement.style.display = 'block';
            }
        });
    });
    
    // Message input handling
    if (messageInput && sendButton) {
        messageInput.addEventListener('input', function() {
            const hasText = this.value.trim().length > 0;
            sendButton.disabled = !hasText;
            
            if (hasText) {
                sendButton.style.background = '#32cd32';
                sendButton.style.cursor = 'pointer';
            } else {
                sendButton.style.background = '#ccc';
                sendButton.style.cursor = 'not-allowed';
            }
        });
        
        // Handle Enter key
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                sendMessage();
            }
        });
        
        // Handle send button click
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Message sending function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        sendButton.disabled = true;
        sendButton.style.background = '#ccc';
        
        // Send to backend
        sendToBackend(message);
    }
    
    // Add message to chat (global function)
    window.addMessage = function addMessage(text, sender) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.style.cssText = `
            display: flex;
            margin-bottom: 1rem;
            align-items: flex-start;
            gap: 0.75rem;
        `;
        
        const avatar = document.createElement('div');
        avatar.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            background: ${sender === 'user' ? '#007bff' : '#32cd32'};
            color: white;
        `;
        avatar.innerHTML = sender === 'user' ? '👤' : '🌱';
        
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            background: ${sender === 'user' ? '#007bff' : '#f0f8f0'};
            color: ${sender === 'user' ? 'white' : '#2c3e50'};
            border-radius: 12px;
            padding: 0.75rem 1rem;
        `;
        content.textContent = text;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Welcome message
    setTimeout(() => {
        addMessage("🌱 Hello! I'm your Plant Companion. Share your thoughts with me and watch me grow! What's on your mind today?", 'bot');
    }, 500);
    
    // Initialize Plant Companion System
    let plantCompanion = null;
    
    setTimeout(() => {
        try {
            plantCompanion = new PlantCompanion();
            plantCompanion.loadState();
            window.plantCompanion = plantCompanion;
            console.log('Plant Companion initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Plant Companion:', error);
        }
    }, 1000);
    
    // Plant growth update function
    window.updatePlantGrowth = function(sentiment) {
        if (plantCompanion) {
            plantCompanion.updateGrowth(sentiment);
            plantCompanion.messageCount++;
        }
    };
    
    console.log('Plant Companion loaded successfully!');
});

// Session ID generation
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

// Backend communication
async function sendToBackend(message) {
    try {
        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-message';
        loadingDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: #f0f8f0;
            border-radius: 12px;
            margin-bottom: 1rem;
            color: #666;
        `;
        loadingDiv.innerHTML = `
            <div style="
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #32cd32;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span>Plant is thinking...</span>
        `;
        document.getElementById('chat-messages').appendChild(loadingDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
        
        const data = await response.json();
        
        // Remove loading
        loadingDiv.remove();
        
        if (data.response) {
            addMessage(data.response, 'bot');
            
            // Update plant growth based on sentiment
            if (data.sentiment) {
                updatePlantGrowth(data.sentiment);
            }
            
            // Update message count
            if (data.messageCount) {
                const chatCountElement = document.getElementById('chat-count');
                if (chatCountElement) {
                    chatCountElement.textContent = data.messageCount;
                }
            }
        } else {
            addMessage("🌱 I'm having trouble connecting right now, but I'm still here for you!", 'bot');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove loading if it exists
        const loadingDiv = document.getElementById('chat-messages').querySelector('.loading-message');
        if (loadingDiv) loadingDiv.remove();
        
        // Fallback response
        const fallbackResponses = [
            "🌱 I'm having connection issues, but I'm still growing! Tell me more about your day.",
            "🌿 Something went wrong, but I'm resilient like a plant! What else is on your mind?",
            "🌸 Technical difficulties can't stop our conversation! Keep sharing with me."
        ];
        const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        addMessage(fallback, 'bot');
    }
}

// Plant Companion Class
class PlantCompanion {
    constructor() {
        this.growthLevel = 20;
        this.mood = 'curious';
        this.name = 'Little Sprout';
        this.achievements = ['first-sprout'];
        this.messageCount = 0;
        this.lastInteraction = Date.now();
        
        // Growth stages configuration
        this.growthStages = {
            0: { name: 'Tiny Seed', stemSegments: 0, leafCount: 0, hasFlower: false },
            20: { name: 'Little Sprout', stemSegments: 1, leafCount: 3, hasFlower: false },
            40: { name: 'Growing Friend', stemSegments: 2, leafCount: 4, hasFlower: false },
            60: { name: 'Plant Companion', stemSegments: 2, leafCount: 5, hasFlower: false },
            80: { name: 'Wise Plant', stemSegments: 3, leafCount: 6, hasFlower: true },
            95: { name: 'Ancient Tree', stemSegments: 3, leafCount: 6, hasFlower: true }
        };
        
        // Mood configurations
        this.moodConfig = {
            happy: { color: '#32cd32', intensity: 1.2, animation: 'mood-happy' },
            excited: { color: '#ffd700', intensity: 1.3, animation: 'mood-excited' },
            sad: { color: '#556b2f', intensity: 0.8, animation: 'mood-sad' },
            curious: { color: '#20b2aa', intensity: 1.05, animation: 'mood-curious' },
            stressed: { color: '#8b4513', intensity: 0.7, animation: 'mood-stressed' },
            content: { color: '#90ee90', intensity: 1.1, animation: 'mood-content' }
        };
        
        this.initializePlant();
    }
    
    initializePlant() {
        this.updateVisualState();
        this.setupInteractions();
        this.startAmbientAnimations();
    }
    
    updateGrowth(sentiment) {
        const growthIncrease = this.calculateGrowthIncrease(sentiment);
        const oldGrowth = this.growthLevel;
        this.growthLevel = Math.min(100, this.growthLevel + growthIncrease);
        
        // Update mood based on sentiment
        this.updateMood(sentiment);
        
        // Check for growth stage changes
        const oldStage = this.getCurrentStage(oldGrowth);
        const newStage = this.getCurrentStage(this.growthLevel);
        
        if (newStage.name !== oldStage.name) {
            this.onStageChange(newStage);
        }
        
        // Update visual state
        this.updateVisualState();
        this.playGrowthAnimation();
        
        // Update UI elements
        this.updateUI();
        
        // Check for achievements
        this.checkAchievements();
    }
    
    calculateGrowthIncrease(sentiment) {
        const baseGrowth = {
            'positive': 3,
            'excited': 5,
            'happy': 4,
            'content': 2,
            'curious': 2,
            'negative': 1,
            'sad': 0.5,
            'stressed': 0.5,
            'neutral': 1.5
        };
        
        return baseGrowth[sentiment] || 1;
    }
    
    updateMood(sentiment) {
        const moodMap = {
            'positive': 'happy',
            'excited': 'excited',
            'happy': 'happy',
            'content': 'content',
            'curious': 'curious',
            'negative': 'sad',
            'sad': 'sad',
            'stressed': 'stressed',
            'neutral': 'curious'
        };
        
        this.mood = moodMap[sentiment] || 'curious';
        this.applyMoodVisuals();
    }
    
    applyMoodVisuals() {
        const container = document.querySelector('.plant-container');
        const moodIndicator = document.querySelector('.mood-aura');
        
        if (container) {
            // Remove existing mood classes
            Object.keys(this.moodConfig).forEach(mood => {
                container.classList.remove(`mood-${mood}`);
            });
            
            // Add current mood class
            container.classList.add(`mood-${this.mood}`);
        }
        
        if (moodIndicator) {
            const config = this.moodConfig[this.mood];
            moodIndicator.style.background = `radial-gradient(circle, ${config.color}40, transparent)`;
        }
        
        // Update plant mood text
        const plantMood = document.getElementById('plant-mood');
        if (plantMood) {
            const moodTexts = {
                happy: 'Feeling joyful! 😊🌿',
                excited: 'So excited to grow! ✨🌱',
                sad: 'A bit down, but growing... 🌧️🌿',
                curious: 'Curious about you! 🤔🌿',
                stressed: 'Feeling overwhelmed... 😰🌿',
                content: 'Peaceful and content 😌🌿'
            };
            plantMood.textContent = moodTexts[this.mood] || 'Growing with you! 🌿';
        }
    }
    
    getCurrentStage(growth = this.growthLevel) {
        const stages = Object.keys(this.growthStages).map(Number).sort((a, b) => b - a);
        const currentStageKey = stages.find(stage => growth >= stage);
        return this.growthStages[currentStageKey];
    }
    
    onStageChange(newStage) {
        this.name = newStage.name;
        this.showStageChangeNotification(newStage);
        this.playStageChangeAnimation();
    }
    
    updateVisualState() {
        const stage = this.getCurrentStage();
        
        // Update stem segments
        this.updateStemSegments(stage.stemSegments);
        
        // Update leaf count
        this.updateLeafCount(stage.leafCount);
        
        // Update flower visibility
        this.updateFlowerVisibility(stage.hasFlower);
        
        // Update plant name
        this.updatePlantName();
    }
    
    updateStemSegments(count) {
        const segments = ['stem-base', 'stem-middle', 'stem-top'];
        segments.forEach((segmentClass, index) => {
            const segment = document.querySelector(`.${segmentClass}`);
            if (segment) {
                segment.style.display = index < count ? 'block' : 'none';
            }
        });
    }
    
    updateLeafCount(count) {
        for (let i = 1; i <= 6; i++) {
            const leaf = document.querySelector(`.leaf-${i}`);
            if (leaf) {
                if (i <= count) {
                    leaf.style.display = 'block';
                    // Trigger growth animation for new leaves
                    if (leaf.style.opacity === '0' || !leaf.style.opacity) {
                        setTimeout(() => {
                            leaf.style.animation = `leafGrowIn 1.5s ease-out ${i * 0.3}s both`;
                        }, 100);
                    }
                } else {
                    leaf.style.display = 'none';
                }
            }
        }
    }
    
    updateFlowerVisibility(hasFlower) {
        const flower = document.getElementById('flower');
        if (flower) {
            if (hasFlower && flower.style.display === 'none') {
                flower.style.display = 'block';
                flower.style.animation = 'flowerBloom 2.5s ease-out both';
            } else if (!hasFlower) {
                flower.style.display = 'none';
            }
        }
    }
    
    updatePlantName() {
        const plantName = document.getElementById('plant-name');
        if (plantName) {
            plantName.textContent = this.name;
        }
    }
    
    updateUI() {
        // Update progress bar
        const progressBar = document.getElementById('growth-progress');
        const growthLevel = document.getElementById('growth-level');
        
        if (progressBar) {
            progressBar.style.width = this.growthLevel + '%';
        }
        
        if (growthLevel) {
            growthLevel.textContent = Math.round(this.growthLevel) + '%';
        }
        
        // Update message count
        const chatCount = document.getElementById('chat-count');
        if (chatCount) {
            chatCount.textContent = this.messageCount;
        }
    }
    
    playGrowthAnimation() {
        const container = document.querySelector('.plant-container');
        if (container) {
            container.classList.add('growing');
            setTimeout(() => {
                container.classList.remove('growing');
            }, 2500);
        }
        
        // Add growth particles
        this.createGrowthParticles();
    }
    
    playStageChangeAnimation() {
        const container = document.querySelector('.plant-container');
        if (container) {
            container.style.animation = 'growthPulse 3s ease-in-out';
            setTimeout(() => {
                container.style.animation = '';
            }, 3000);
        }
    }
    
    createGrowthParticles() {
        const effectsContainer = document.getElementById('growth-effects');
        if (!effectsContainer) return;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'growth-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 1 + 's';
            
            effectsContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }
    
    setupInteractions() {
        const container = document.querySelector('.plant-container');
        if (!container) return;
        
        // Main plant click handler
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('leaf') || e.target.classList.contains('flower')) {
                return; // Let specific handlers deal with these
            }
            this.handlePlantClick();
        });
        
        // Setup individual element interactions
        this.setupLeafInteractions();
        this.setupFlowerInteractions();
        
        // Add hover tooltip
        this.setupTooltip();
    }
    
    handlePlantClick() {
        const container = document.querySelector('.plant-container');
        if (!container || container.classList.contains('clicked')) return;
        
        // Visual feedback
        container.classList.add('clicked');
        this.createSparkles();
        this.createHeartParticles();
        this.createRippleEffect(container);
        this.addGlowEffect();
        
        // Generate encouraging message
        const encouragingMessages = [
            "🌱 Thank you for caring for me! Your attention helps me grow stronger!",
            "🌿 I love when you interact with me! Each click fills me with joy!",
            "💚 Your kindness makes my leaves shimmer with happiness!",
            "✨ Every touch helps me bloom brighter! You're amazing!",
            "🌸 I can feel your positive energy! It's helping me flourish!",
            "🌟 Your care and attention mean the world to me!",
            "🌺 Together we're growing something beautiful!",
            "💫 Your support gives me strength to reach new heights!"
        ];
        
        const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        if (window.addMessage) {
            window.addMessage(message, 'bot');
        }
        
        // Update growth slightly
        this.growthLevel = Math.min(100, this.growthLevel + 0.5);
        this.messageCount++;
        this.updateUI();
        
        // Remove clicked state
        setTimeout(() => {
            container.classList.remove('clicked');
        }, 600);
    }
    
    setupLeafInteractions() {
        const leaves = document.querySelectorAll('.leaf');
        leaves.forEach((leaf, index) => {
            leaf.style.cursor = 'pointer';
            leaf.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLeafClick(leaf, index);
            });
        });
    }
    
    setupFlowerInteractions() {
        const flower = document.getElementById('flower');
        if (flower) {
            flower.style.cursor = 'pointer';
            flower.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFlowerClick();
            });
        }
    }
    
    handleLeafClick(leaf, index) {
        // Prevent multiple rapid clicks
        if (leaf.classList.contains('leaf-clicked')) return;
        
        leaf.classList.add('leaf-clicked');
        leaf.style.animation = 'leafClickPulse 0.6s ease-out';
        
        // Create mini sparkles around the leaf
        this.createLeafSparkles(leaf);
        
        // Generate leaf-specific encouraging message
        const leafMessages = [
            "🍃 This leaf loves your attention!",
            "🌿 Each leaf represents your growth!",
            "💚 You're helping me grow stronger!",
            "✨ My leaves dance with joy when you care!"
        ];
        
        const message = leafMessages[Math.floor(Math.random() * leafMessages.length)];
        if (window.addMessage) {
            window.addMessage(message, 'bot');
        }
        
        setTimeout(() => {
            leaf.classList.remove('leaf-clicked');
            leaf.style.animation = '';
        }, 600);
    }
    
    handleFlowerClick() {
        const flower = document.getElementById('flower');
        if (!flower || flower.classList.contains('flower-clicked')) return;
        
        flower.classList.add('flower-clicked');
        flower.style.animation = 'flowerSparkle 1s ease-out';
        
        // Create special flower effects
        this.createFlowerSparkles();
        
        // Generate flower-specific encouraging message
        const flowerMessages = [
            "🌸 My flower blooms brighter with your care!",
            "🌺 You've helped me reach full bloom!",
            "🌻 This flower represents our beautiful friendship!",
            "💐 Thank you for helping me blossom!"
        ];
        
        const message = flowerMessages[Math.floor(Math.random() * flowerMessages.length)];
        if (window.addMessage) {
            window.addMessage(message, 'bot');
        }
        
        setTimeout(() => {
            flower.classList.remove('flower-clicked');
            flower.style.animation = '';
        }, 1000);
    }
    
    createSparkles() {
        const sparklesContainer = document.getElementById('sparkles');
        if (!sparklesContainer) return;
        
        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, #ffd700, #ffeb3b);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: sparkleFloat 1.5s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
                z-index: 10;
            `;
            
            sparklesContainer.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.remove();
                }
            }, 2000);
        }
    }
    
    createHeartParticles() {
        const container = document.querySelector('.plant-container');
        if (!container) return;
        
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '💚';
            heart.style.cssText = `
                position: absolute;
                font-size: 16px;
                left: ${40 + Math.random() * 20}%;
                top: 60%;
                animation: heartFloat 2s ease-out forwards;
                animation-delay: ${i * 0.2}s;
                z-index: 15;
                pointer-events: none;
            `;
            
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 2500);
        }
    }
    
    createRippleEffect(container) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(50, 205, 50, 0.3);
            transform: translate(-50%, -50%);
            animation: rippleExpand 0.8s ease-out forwards;
            pointer-events: none;
            z-index: 5;
        `;
        
        container.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 800);
    }
    
    addGlowEffect() {
        const container = document.querySelector('.plant-container');
        if (!container) return;
        
        container.style.filter = 'drop-shadow(0 0 20px rgba(50, 205, 50, 0.6))';
        
        setTimeout(() => {
            container.style.filter = '';
        }, 1500);
    }
    
    createLeafSparkles(leaf) {
        const rect = leaf.getBoundingClientRect();
        const container = document.querySelector('.plant-container');
        
        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 12px;
                left: ${rect.left - container.getBoundingClientRect().left + Math.random() * 20}px;
                top: ${rect.top - container.getBoundingClientRect().top + Math.random() * 20}px;
                animation: miniSparkle 1s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                z-index: 20;
                pointer-events: none;
            `;
            
            container.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.remove();
                }
            }, 1200);
        }
    }
    
    createFlowerSparkles() {
        const flower = document.getElementById('flower');
        const container = document.querySelector('.plant-container');
        if (!flower || !container) return;
        
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '🌟';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 14px;
                left: ${45 + Math.random() * 10}%;
                top: ${10 + Math.random() * 10}%;
                animation: flowerSparkleFloat 1.5s ease-out forwards;
                animation-delay: ${i * 0.1}s;
                z-index: 25;
                pointer-events: none;
            `;
            
            container.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.remove();
                }
            }, 1800);
        }
    }
    
    setupTooltip() {
        const container = document.querySelector('.plant-container');
        const tooltip = document.getElementById('plant-tooltip');
        
        if (!container || !tooltip) return;
        
        container.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
            tooltip.style.animation = 'tooltipFadeIn 0.3s ease-out';
        });
        
        container.addEventListener('mouseleave', () => {
            tooltip.style.animation = 'tooltipFadeOut 0.3s ease-out';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 300);
        });
    }
    
    startAmbientAnimations() {
        // Gentle ambient sparkles
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every interval
                this.createAmbientSparkle();
            }
        }, 5000);
        
        // Gentle leaf movement
        setInterval(() => {
            this.animateLeafBreeze();
        }, 8000);
    }
    
    createAmbientSparkle() {
        const container = document.querySelector('.plant-container');
        if (!container) return;
        
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
            position: absolute;
            font-size: 10px;
            left: ${20 + Math.random() * 60}%;
            top: ${20 + Math.random() * 60}%;
            animation: ambientSparkle 3s ease-out forwards;
            z-index: 5;
            pointer-events: none;
            opacity: 0.7;
        `;
        
        container.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 3000);
    }
    
    animateLeafBreeze() {
        const leaves = document.querySelectorAll('.leaf');
        leaves.forEach((leaf, index) => {
            setTimeout(() => {
                leaf.style.animation = 'leafBreeze 2s ease-in-out';
                setTimeout(() => {
                    leaf.style.animation = '';
                }, 2000);
            }, index * 200);
        });
    }
    
    showStageChangeNotification(stage) {
        const notification = document.createElement('div');
        notification.className = 'stage-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #32cd32, #228b22);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(50, 205, 50, 0.3);
            animation: notificationSlide 4s ease-in-out forwards;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div class="stage-content">
                <div class="stage-emoji" style="font-size: 3rem; margin-bottom: 1rem;">🌟</div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.4rem;">Growth Milestone!</h3>
                <p style="margin: 0; font-size: 1rem; opacity: 0.9;">I've grown into a ${stage.name}!</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // Growth-based achievements
        if (this.growthLevel >= 25 && !this.achievements.includes('quarter-grown')) {
            newAchievements.push({
                id: 'quarter-grown',
                name: 'Quarter Grown',
                description: 'Reached 25% growth!',
                icon: '🌱'
            });
        }
        
        if (this.growthLevel >= 50 && !this.achievements.includes('half-grown')) {
            newAchievements.push({
                id: 'half-grown',
                name: 'Half Grown',
                description: 'Reached 50% growth!',
                icon: '🌿'
            });
        }
        
        if (this.growthLevel >= 75 && !this.achievements.includes('mostly-grown')) {
            newAchievements.push({
                id: 'mostly-grown',
                name: 'Mostly Grown',
                description: 'Reached 75% growth!',
                icon: '🌳'
            });
        }
        
        if (this.growthLevel >= 100 && !this.achievements.includes('fully-grown')) {
            newAchievements.push({
                id: 'fully-grown',
                name: 'Fully Grown',
                description: 'Reached maximum growth!',
                icon: '🌺'
            });
        }
        
        // Message-based achievements
        if (this.messageCount >= 10 && !this.achievements.includes('chatty')) {
            newAchievements.push({
                id: 'chatty',
                name: 'Chatty Friend',
                description: 'Had 10 conversations!',
                icon: '💬'
            });
        }
        
        if (this.messageCount >= 50 && !this.achievements.includes('deep-connection')) {
            newAchievements.push({
                id: 'deep-connection',
                name: 'Deep Connection',
                description: 'Had 50 conversations!',
                icon: '💝'
            });
        }
        
        // Show new achievements
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement.id);
            this.showAchievementNotification(achievement);
        });
        
        this.saveState();
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700, #ffb347);
            color: #2d5016;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
            z-index: 1000;
            animation: achievementSlide 5s ease-in-out forwards;
            max-width: 280px;
            border: 2px solid #ffb347;
        `;
        
        notification.innerHTML = `
            <div class="achievement-header">
                <span class="achievement-icon">${achievement.icon}</span>
                <span class="achievement-rarity">Achievement Unlocked!</span>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    saveState() {
        const state = {
            growthLevel: this.growthLevel,
            mood: this.mood,
            name: this.name,
            achievements: this.achievements,
            messageCount: this.messageCount,
            lastInteraction: this.lastInteraction,
            savedAt: Date.now()
        };
        
        try {
            localStorage.setItem('plantCompanionState', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save plant state:', error);
        }
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem('plantCompanionState');
            if (!saved) return false;
            
            const state = JSON.parse(saved);
            
            // Validate saved state
            if (typeof state.growthLevel === 'number') {
                this.growthLevel = Math.max(0, Math.min(100, state.growthLevel));
            }
            if (typeof state.messageCount === 'number') {
                this.messageCount = Math.max(0, state.messageCount);
            }
            if (Array.isArray(state.achievements)) {
                this.achievements = state.achievements;
            }
            if (state.mood) {
                this.mood = state.mood;
            }
            if (state.name) {
                this.name = state.name;
            }
            
            this.updateVisualState();
            this.updateUI();
            
            return true;
        } catch (error) {
            console.warn('Failed to load plant state:', error);
            return false;
        }
    }
}

// Page Manager for Garden and Insights
class PageManager {
    constructor() {
        this.currentPage = 'chat';
        this.setupNavigation();
        this.updatePageContent();
    }
    
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = btn.getAttribute('data-page');
                this.navigateToPage(targetPage);
            });
        });
    }
    
    navigateToPage(pageName) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
        
        // Show target page
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            this.currentPage = pageName;
            this.updatePageContent();
        }
    }
    
    updatePageContent() {
        switch (this.currentPage) {
            case 'garden':
                this.updateGardenPage();
                break;
            case 'insights':
                this.updateInsightsPage();
                break;
        }
    }
    
    updateGardenPage() {
        const plantCompanion = window.plantCompanion;
        if (!plantCompanion) return;
        
        // Update garden stats
        const gardenGrowth = document.getElementById('garden-growth');
        const gardenChats = document.getElementById('garden-chats');
        const gardenAchievements = document.getElementById('garden-achievements');
        
        if (gardenGrowth) gardenGrowth.textContent = Math.round(plantCompanion.growthLevel) + '%';
        if (gardenChats) gardenChats.textContent = plantCompanion.messageCount;
        if (gardenAchievements) gardenAchievements.textContent = plantCompanion.achievements.length;
        
        // Update achievements list
        this.updateAchievementsList();
    }
    
    updateInsightsPage() {
        const plantCompanion = window.plantCompanion;
        if (!plantCompanion) return;
        
        // Update insights stats
        const insightsGrowth = document.getElementById('insights-growth');
        const insightsChats = document.getElementById('insights-chats');
        const insightsMood = document.getElementById('insights-mood');
        const insightsStage = document.getElementById('insights-stage');
        
        if (insightsGrowth) insightsGrowth.textContent = Math.round(plantCompanion.growthLevel) + '%';
        if (insightsChats) insightsChats.textContent = plantCompanion.messageCount;
        if (insightsMood) insightsMood.textContent = this.getMoodEmoji(plantCompanion.mood) + ' ' + this.getMoodText(plantCompanion.mood);
        if (insightsStage) insightsStage.textContent = plantCompanion.name;
        
        // Update growth timeline
        this.updateGrowthTimeline();
        
        // Update growth tips
        this.updateGrowthTips();
    }
    
    updateAchievementsList() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;
        
        const plantCompanion = window.plantCompanion;
        if (!plantCompanion) return;
        
        const allAchievements = [
            { id: 'first-sprout', name: 'First Sprout', description: 'Started your growth journey!', icon: '🌱', unlocked: true },
            { id: 'quarter-grown', name: 'Quarter Grown', description: 'Reached 25% growth!', icon: '🌿', unlocked: plantCompanion.growthLevel >= 25 },
            { id: 'half-grown', name: 'Half Grown', description: 'Reached 50% growth!', icon: '🌳', unlocked: plantCompanion.growthLevel >= 50 },
            { id: 'mostly-grown', name: 'Mostly Grown', description: 'Reached 75% growth!', icon: '🌲', unlocked: plantCompanion.growthLevel >= 75 },
            { id: 'fully-grown', name: 'Fully Grown', description: 'Reached maximum growth!', icon: '🌺', unlocked: plantCompanion.growthLevel >= 100 },
            { id: 'chatty', name: 'Chatty Friend', description: 'Had 10 conversations!', icon: '💬', unlocked: plantCompanion.messageCount >= 10 },
            { id: 'deep-connection', name: 'Deep Connection', description: 'Had 50 conversations!', icon: '💝', unlocked: plantCompanion.messageCount >= 50 },
            { id: 'century-club', name: 'Century Club', description: 'Had 100 conversations!', icon: '🎉', unlocked: plantCompanion.messageCount >= 100 }
        ];
        
        achievementsList.innerHTML = '';
        
        allAchievements.forEach(achievement => {
            const achievementDiv = document.createElement('div');
            achievementDiv.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 1rem;
                margin-bottom: 0.5rem;
                border-radius: 10px;
                background: ${achievement.unlocked ? 'linear-gradient(135deg, #32cd32, #228b22)' : '#f0f0f0'};
                color: ${achievement.unlocked ? 'white' : '#666'};
                opacity: ${achievement.unlocked ? '1' : '0.6'};
                transition: all 0.3s ease;
            `;
            
            achievementDiv.innerHTML = `
                <div style="font-size: 2rem; margin-right: 1rem;">${achievement.icon}</div>
                <div>
                    <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem;">${achievement.name}</h4>
                    <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">${achievement.description}</p>
                </div>
                ${achievement.unlocked ? '<div style="margin-left: auto; font-size: 1.5rem;">✅</div>' : ''}
            `;
            
            achievementsList.appendChild(achievementDiv);
        });
    }
    
    updateGrowthTimeline() {
        const timeline = document.getElementById('growth-timeline');
        if (!timeline) return;
        
        const plantCompanion = window.plantCompanion;
        if (!plantCompanion) return;
        
        const milestones = [
            { level: 0, name: 'Tiny Seed', icon: '🌰', reached: true },
            { level: 20, name: 'Little Sprout', icon: '🌱', reached: plantCompanion.growthLevel >= 20 },
            { level: 40, name: 'Growing Friend', icon: '🌿', reached: plantCompanion.growthLevel >= 40 },
            { level: 60, name: 'Plant Companion', icon: '🌳', reached: plantCompanion.growthLevel >= 60 },
            { level: 80, name: 'Wise Plant', icon: '🌲', reached: plantCompanion.growthLevel >= 80 },
            { level: 100, name: 'Ancient Tree', icon: '🌺', reached: plantCompanion.growthLevel >= 100 }
        ];
        
        timeline.innerHTML = '';
        
        milestones.forEach((milestone, index) => {
            const milestoneDiv = document.createElement('div');
            milestoneDiv.className = 'timeline-milestone';
            milestoneDiv.style.cssText = `
                display: flex;
                align-items: center;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                border-radius: 8px;
                background: ${milestone.reached ? 'rgba(50, 205, 50, 0.1)' : 'rgba(200, 200, 200, 0.1)'};
                border-left: 4px solid ${milestone.reached ? '#32cd32' : '#ccc'};
                transition: all 0.3s ease;
            `;
            
            milestoneDiv.innerHTML = `
                <div style="font-size: 1.5rem; margin-right: 1rem;">${milestone.icon}</div>
                <div>
                    <h5 style="margin: 0 0 0.25rem 0; color: ${milestone.reached ? '#2d5016' : '#666'};">${milestone.name}</h5>
                    <small style="color: ${milestone.reached ? '#5a7c3a' : '#999'};">${milestone.level}% Growth</small>
                </div>
                ${milestone.reached ? '<div style="margin-left: auto; color: #32cd32;">✓</div>' : ''}
            `;
            
            timeline.appendChild(milestoneDiv);
        });
    }
    
    updateGrowthTips() {
        const tipsContainer = document.getElementById('growth-tips');
        if (!tipsContainer) return;
        
        const plantCompanion = window.plantCompanion;
        if (!plantCompanion) return;
        
        const tips = [
            {
                title: "Keep Chatting!",
                description: "Regular conversations help me grow faster. Share your thoughts, dreams, and daily experiences!",
                icon: "💬"
            },
            {
                title: "Share Your Emotions",
                description: "I grow best when you're honest about your feelings. Both positive and challenging emotions help me understand you better.",
                icon: "💚"
            },
            {
                title: "Set Goals Together",
                description: "Tell me about your aspirations! I love helping you plan and achieve your dreams.",
                icon: "🎯"
            },
            {
                title: "Click and Interact",
                description: "Don't forget to click on me and my leaves! Physical interaction strengthens our bond.",
                icon: "👆"
            }
        ];
        
        // Add growth-specific tips
        if (plantCompanion.growthLevel < 50) {
            tips.push({
                title: "Early Growth Phase",
                description: "You're in the early stages of our journey. Keep sharing your daily experiences to help me grow!",
                icon: "🌱"
            });
        } else if (plantCompanion.growthLevel < 80) {
            tips.push({
                title: "Steady Progress",
                description: "Great progress! I'm becoming more mature. Let's explore deeper topics and meaningful conversations.",
                icon: "🌿"
            });
        } else {
            tips.push({
                title: "Mature Companion",
                description: "I'm now a mature plant companion! I can provide more sophisticated advice and support.",
                icon: "🌳"
            });
        }
        
        tipsContainer.innerHTML = '';
        
        tips.forEach(tip => {
            const tipDiv = document.createElement('div');
            tipDiv.className = 'growth-tip';
            tipDiv.style.cssText = `
                background: rgba(50, 205, 50, 0.05);
                border: 1px solid rgba(50, 205, 50, 0.2);
                border-radius: 10px;
                padding: 1rem;
                margin-bottom: 0.75rem;
                transition: all 0.3s ease;
            `;
            
            tipDiv.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                    <div style="font-size: 1.5rem; flex-shrink: 0;">${tip.icon}</div>
                    <div>
                        <h5 style="margin: 0 0 0.5rem 0; color: #2d5016; font-size: 1rem;">${tip.title}</h5>
                        <p style="margin: 0; color: #5a7c3a; font-size: 0.9rem; line-height: 1.4;">${tip.description}</p>
                    </div>
                </div>
            `;
            
            // Add hover effect
            tipDiv.addEventListener('mouseenter', () => {
                tipDiv.style.background = 'rgba(50, 205, 50, 0.1)';
                tipDiv.style.borderColor = 'rgba(50, 205, 50, 0.3)';
            });
            
            tipDiv.addEventListener('mouseleave', () => {
                tipDiv.style.background = 'rgba(50, 205, 50, 0.05)';
                tipDiv.style.borderColor = 'rgba(50, 205, 50, 0.2)';
            });
            
            tipsContainer.appendChild(tipDiv);
        });
    }
    
    getMoodEmoji(mood) {
        const moodEmojis = {
            'happy': '😊',
            'excited': '🤩',
            'sad': '😢',
            'curious': '🤔',
            'stressed': '😰',
            'content': '😌'
        };
        return moodEmojis[mood] || '🌿';
    }
    
    getMoodText(mood) {
        const moodTexts = {
            'happy': 'Happy',
            'excited': 'Excited',
            'sad': 'Sad',
            'curious': 'Curious',
            'stressed': 'Stressed',
            'content': 'Content'
        };
        return moodTexts[mood] || 'Curious';
    }
}

// Initialize page manager after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.pageManager = new PageManager();
    }, 1500);
});

// Update page content when plant companion updates
window.updatePageContent = function() {
    if (window.pageManager) {
        window.pageManager.updatePageContent();
    }
};

// Add CSS animations for new features
const additionalStyles = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes notificationSlide {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        15% { transform: translate(-50%, -50%) scale(1); }
        85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    
    @keyframes achievementSlide {
        0% { opacity: 0; transform: translateX(100%); }
        10% { opacity: 1; transform: translateX(0); }
        90% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(100%); }
    }
    
    @keyframes ambientSparkle {
        0% { opacity: 0; transform: scale(0); }
        20% { opacity: 0.7; transform: scale(1); }
        80% { opacity: 0.4; transform: scale(1.1) translateY(-10px); }
        100% { opacity: 0; transform: scale(0.5) translateY(-20px); }
    }
    
    @keyframes leafBreeze {
        0%, 100% { transform: rotate(var(--rotation, 0deg)) translateY(0); }
        25% { transform: rotate(calc(var(--rotation, 0deg) + 2deg)) translateY(-2px); }
        75% { transform: rotate(calc(var(--rotation, 0deg) - 1deg)) translateY(-1px); }
    }
    
    @keyframes rippleExpand {
        0% { width: 0; height: 0; opacity: 0.8; }
        100% { width: 200px; height: 200px; opacity: 0; }
    }
    
    @keyframes heartFloat {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        50% { opacity: 0.8; transform: translateY(-30px) scale(1.2); }
        100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
    }
    
    @keyframes sparkleFloat {
        0% { opacity: 1; transform: translateY(0) scale(0); }
        20% { opacity: 1; transform: translateY(-10px) scale(1); }
        100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
    }
    
    @keyframes tooltipFadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes tooltipFadeOut {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
    
    @keyframes leafClickPulse {
        0% { transform: rotate(var(--rotation, 0deg)) scale(1); filter: brightness(1); }
        50% { transform: rotate(var(--rotation, 0deg)) scale(1.2); filter: brightness(1.3) drop-shadow(0 0 10px rgba(50, 205, 50, 0.6)); }
        100% { transform: rotate(var(--rotation, 0deg)) scale(1); filter: brightness(1); }
    }
    
    @keyframes flowerSparkle {
        0% { transform: translateX(-50%) scale(1) rotate(0deg); filter: brightness(1); }
        50% { transform: translateX(-50%) scale(1.15) rotate(180deg); filter: brightness(1.4) drop-shadow(0 0 15px rgba(255, 105, 180, 0.8)); }
        100% { transform: translateX(-50%) scale(1) rotate(360deg); filter: brightness(1.2); }
    }
    
    @keyframes miniSparkle {
        0% { opacity: 1; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        100% { opacity: 0; transform: scale(0.5) rotate(360deg) translateY(-20px); }
    }
    
    @keyframes flowerSparkleFloat {
        0% { opacity: 1; transform: scale(0) rotate(0deg); }
        30% { opacity: 1; transform: scale(1.3) rotate(120deg); }
        100% { opacity: 0; transform: scale(0.7) rotate(360deg) translateY(-40px); }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);