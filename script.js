document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const movesDisplay = document.getElementById('moves');
    const timerDisplay = document.getElementById('timer');
    const matchesDisplay = document.getElementById('matches');
    const restartButton = document.getElementById('restart');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const celebration = document.getElementById('celebration');
    
    // Sound effects
    const flipSound = document.getElementById('flipSound');
    const matchSound = document.getElementById('matchSound');
    const winSound = document.getElementById('winSound');
    
    // Game variables
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let matchedPairs = 0;
    let totalPairs = 8; // Default to easy mode (8 pairs)
    let gameSize = 4; // Default 4x4 grid
    
    // Emoji icons for the cards
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦'];
    
    // Initialize the game
    function initGame() {
        // Reset game state
        clearInterval(timerInterval);
        moves = 0;
        timer = 0;
        matchedPairs = 0;
        movesDisplay.textContent = moves;
        timerDisplay.textContent = timer;
        matchesDisplay.textContent = `0/${totalPairs}`;
        lockBoard = false;
        hasFlippedCard = false;
        [firstCard, secondCard] = [null, null];
        
        // Create cards based on difficulty
        const selectedEmojis = emojis.slice(0, totalPairs);
        cards = [...selectedEmojis, ...selectedEmojis];
        
        // Shuffle cards
        shuffleCards();
        
        // Create game board
        createBoard();
        
        // Start timer
        startTimer();
    }
    
    // Set game difficulty
    function setDifficulty(difficulty) {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        switch(difficulty) {
            case 'easy':
                totalPairs = 8;
                gameSize = 4;
                break;
            case 'medium':
                totalPairs = 12;
                gameSize = 6;
                break;
            case 'hard':
                totalPairs = 16;
                gameSize = 8;
                break;
        }
        
        initGame();
    }
    
    // Shuffle cards using Fisher-Yates algorithm
    function shuffleCards() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }
    
    // Create the game board with cards
    function createBoard() {
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${gameSize}, 1fr)`;
        
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.index = index;
            
            const frontFace = document.createElement('div');
            frontFace.classList.add('front-face');
            frontFace.textContent = emoji;
            
            const backFace = document.createElement('div');
            backFace.classList.add('back-face');
            
            card.appendChild(frontFace);
            card.appendChild(backFace);
            
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }
    
    // Flip a card
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        if (this.classList.contains('matched')) return;
        
        // Play flip sound
        flipSound.currentTime = 0;
        flipSound.play();
        
        this.classList.add('flipped');
        this.classList.add('bounce');
        
        // Remove bounce animation after it completes
        setTimeout(() => {
            this.classList.remove('bounce');
        }, 500);
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        moves++;
        movesDisplay.textContent = moves;
        
        checkForMatch();
    }
    
    // Check if the two flipped cards match
    function checkForMatch() {
        const firstEmoji = firstCard.querySelector('.front-face').textContent;
        const secondEmoji = secondCard.querySelector('.front-face').textContent;
        
        if (firstEmoji === secondEmoji) {
            // Match found
            disableCards();
            matchedPairs++;
            matchesDisplay.textContent = `${matchedPairs}/${totalPairs}`;
            
            // Play match sound
            matchSound.currentTime = 0;
            matchSound.play();
            
            // Add pulse animation to matched cards
            firstCard.classList.add('pulse');
            secondCard.classList.add('pulse');
            
            if (matchedPairs === totalPairs) {
                // Game over
                clearInterval(timerInterval);
                setTimeout(() => {
                    celebrate();
                    // Play win sound
                    winSound.currentTime = 0;
                    winSound.play();
                    
                    // Show win message with stats
                    Swal.fire({
                        title: '🎉 You Win! 🎉',
                        html: `You completed the game in <b>${moves}</b> moves and <b>${timer}</b> seconds!`,
                        icon: 'success',
                        confirmButtonText: 'Play Again',
                        background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                        color: 'white',
                        backdrop: `
                            rgba(0,0,123,0.4)
                            url("https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif")
                            center top
                            no-repeat
                        `
                    }).then(() => {
                        initGame();
                    });
                }, 1000);
            }
        } else {
            // No match
            unflipCards();
        }
    }
    
    // Disable matched cards
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        resetBoard();
    }
    
    // Unflip non-matching cards
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            resetBoard();
        }, 1000);
    }
    
    // Reset board state after each turn
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // Start the game timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = timer;
        }, 1000);
    }
    
    // Celebration animation when game is won
    function celebrate() {
        celebration.style.display = 'block';
        celebration.innerHTML = '';
        
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `confetti ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.opacity = '0.8';
            
            celebration.appendChild(confetti);
        }
        
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 5000);
    }
    
    // Event listeners
    restartButton.addEventListener('click', initGame);
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
    });
    
    // Initialize SweetAlert if not already loaded
    if (typeof Swal === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(script);
    }
    
    // Initialize the game when the page loads (easy mode by default)
    initGame();
});