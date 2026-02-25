// Speed Reading App Logic

// Function to parse text
function parseText(text) {
    // Splits the text into an array of words
    return text.split(' ');
}

// Function to control playback
class Playback {
    constructor(words) {
        this.words = words;
        this.currentIndex = 0;
    }
    play() {
        if (this.currentIndex < this.words.length) {
            console.log(this.words[this.currentIndex]); // Display the word
            this.currentIndex++;
            setTimeout(() => this.play(), 300); // Adjust the speed here
        }
    }
    pause() {
        clearTimeout(this);
    }
}

// Function to handle local storage
function saveProgress(currentIndex) {
    localStorage.setItem('currentWordIndex', currentIndex);
}

function loadProgress() {
    return localStorage.getItem('currentWordIndex') || 0;
}

// Function for word navigation
function navigateWords(playback, direction) {
    if (direction === 'next') {
        playback.currentIndex = Math.min(playback.currentIndex + 1, playback.words.length - 1);
    } else if (direction === 'previous') {
        playback.currentIndex = Math.max(playback.currentIndex - 1, 0);
    }
    console.log(playback.words[playback.currentIndex]); // Display the current word
}

// Example usage
const text = "This is an example text for the speed reading app.";
const words = parseText(text);
const playback = new Playback(words);
playback.play();

// Save and load functionality example
saveProgress(playback.currentIndex);
loadProgress();
