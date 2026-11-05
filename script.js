const quotes = [
    "“You are free from judgment, especially from yourself.” — Dan Millman",
    "“Take things one day, one class, and one breath at a time.” — Oprah Winfrey",
    "“Your mental health is a priority, not an afterthought.” — Unknown",
    "“Small progress each day adds up to big results.” — Satya N. Kothari",
    "“It's okay to take a pause and catch your breath.” — Unknown"
];
let lastQuoteIndex = -1;

window.onload = function() {
    initTheme();
    checkAuth();
    loadDailyQuote();
    loadMoodHistory();
    loadJournalEntries();
    updateStats();
    updateAvatarUI();
};

window.switchTab = function(tabId) {
    document.querySelectorAll(".tab-view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".bottom-nav .nav-item").forEach(n => n.classList.remove("active"));

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.add("active");

    document.querySelectorAll(`.bottom-nav [data-tab="${tabId}"]`).forEach(item => {
        item.classList.add("active");
    });

    const appContent = document.querySelector(".app-content");
    if (appContent) appContent.scrollTop = 0;
};

window.loadDailyQuote = function() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * quotes.length);
    } while (randomIndex === lastQuoteIndex && quotes.length > 1);

    lastQuoteIndex = randomIndex;
    const quoteEl = document.getElementById("quote-text");
    if (quoteEl) quoteEl.innerText = quotes[randomIndex];
};

window.handleAuth = function() {
    const nameInput = document.getElementById("auth-name").value.trim();
    const pinInput = document.getElementById("auth-pin").value.trim();

    if (!nameInput || !pinInput) {
        alert("Please enter both your name and a custom PIN.");
        return;
    }

    localStorage.setItem("soluna_user", nameInput);
    localStorage.setItem("soluna_pin", pinInput);
    checkAuth();
    updateAvatarUI();
};

function checkAuth() {
    const user = localStorage.getItem("soluna_user");
    const authScreen = document.getElementById("auth-screen");
    const appScreen = document.getElementById("app-screen");

    if (user) {
        if (authScreen) authScreen.classList.add("hidden");
        if (appScreen) appScreen.classList.remove("hidden");
        
        document.getElementById("welcome-user-subtitle").innerText = `Welcome back, ${user}`;
        document.getElementById("greeting-title").innerText = `Hello there, ${user} ✨`;
        document.getElementById("profile-name").innerText = user;
        updateAvatarUI();
    } else {
        if (authScreen) authScreen.classList.remove("hidden");
        if (appScreen) appScreen.classList.add("hidden");
    }
}

window.logoutUser = function() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("soluna_user");
        localStorage.removeItem("soluna_pin");
        checkAuth();
    }
};

window.setAvatar = function(avatarVal) {
    localStorage.setItem("soluna_avatar", avatarVal);
    localStorage.setItem("soluna_avatar_type", "emoji");
    updateAvatarUI();
};

window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        localStorage.setItem("soluna_avatar", e.target.result);
        localStorage.setItem("soluna_avatar_type", "image");
        updateAvatarUI();
    };
    reader.readAsDataURL(file);
};

function updateAvatarUI() {
    const avatarContainer = document.getElementById("user-avatar-container");
    const type = localStorage.getItem("soluna_avatar_type");
    const val = localStorage.getItem("soluna_avatar");
    const user = localStorage.getItem("soluna_user") || "S";

    if (!avatarContainer) return;

    if (type === "image" && val) {
        avatarContainer.innerHTML = `<img src="${val}" class="avatar-preview" alt="Profile Picture">`;
    } else if (type === "emoji" && val) {
        avatarContainer.innerHTML = `<div class="avatar-preview">${val}</div>`;
    } else {
        avatarContainer.innerHTML = `<div class="avatar-circle" id="user-avatar-initial">${user.charAt(0).toUpperCase()}</div>`;
    }
}

window.setTheme = function(themeName) {
    const container = document.getElementById("phone-container");
    if (container) {
        container.setAttribute("data-theme", themeName);
        localStorage.setItem("soluna_theme", themeName);
    }

    document.querySelectorAll(".theme-btn").forEach(btn => btn.classList.remove("active-theme"));
    const activeBtn = document.getElementById(`theme-btn-${themeName}`);
    if (activeBtn) activeBtn.classList.add("active-theme");
};

function initTheme() {
    const savedTheme = localStorage.getItem("soluna_theme") || "midnight";
    setTheme(savedTheme);
}

window.trackMood = function(moodText, emoji) {
    const today = new Date().toLocaleDateString();
    const moodData = { text: moodText, emoji: emoji, date: today };

    localStorage.setItem("soluna_today_mood", JSON.stringify(moodData));

    let history = JSON.parse(localStorage.getItem("soluna_mood_history")) || [];
    history = history.filter(item => item.date !== today);
    history.unshift(moodData);
    localStorage.setItem("soluna_mood_history", JSON.stringify(history));

    updateMoodUI();
    updateStats();
};

function updateMoodUI() {
    const currentMood = JSON.parse(localStorage.getItem("soluna_today_mood"));
    const display = document.getElementById("home-mood-display");
    const statusBadge = document.getElementById("current-mood-status");

    if (currentMood) {
        if (display) display.innerText = currentMood.text;
        if (statusBadge) statusBadge.innerText = `Logged today: ${currentMood.text}`;
    } else {
        if (display) display.innerText = "Not logged";
        if (statusBadge) statusBadge.innerText = "No mood logged today";
    }

    loadMoodHistory();
}

function loadMoodHistory() {
    const history = JSON.parse(localStorage.getItem("soluna_mood_history")) || [];
    const list = document.getElementById("mood-history-list");
    if (!list) return;

    list.innerHTML = "";
    if (history.length === 0) {
        list.innerHTML = `<li style="justify-content:center; color:var(--text-muted);">No mood history yet.</li>`;
        return;
    }

    history.slice(0, 5).forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${item.date}</span> <strong>${item.text}</strong>`;
        list.appendChild(li);
    });

    updateMoodUI();
}

window.saveJournalEntry = function() {
    const input = document.getElementById("journal-input");
    if (!input) return;
    const text = input.value.trim();

    if (!text) {
        alert("Please write something before saving.");
        return;
    }

    const entries = JSON.parse(localStorage.getItem("soluna_journal")) || [];
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        body: text
    };

    entries.unshift(newEntry);
    localStorage.setItem("soluna_journal", JSON.stringify(entries));

    input.value = "";
    loadJournalEntries();
    updateStats();
};

function loadJournalEntries() {
    const entries = JSON.parse(localStorage.getItem("soluna_journal")) || [];
    const container = document.getElementById("journal-list");
    if (!container) return;

    container.innerHTML = "";
    if (entries.length === 0) {
        container.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No journal entries yet. Your thoughts are safe here.</p>`;
        return;
    }

    entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "journal-entry-card";
        card.innerHTML = `
            <div class="entry-date">${entry.date}</div>
            <div class="entry-body">${escapeHTML(entry.body)}</div>
        `;
        container.appendChild(card);
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

let isBreathing = false, breathingInterval = null;
window.toggleBreathing = function() {
    const circle = document.getElementById("circle");
    const text = document.getElementById("breathing-text");
    const btn = document.getElementById("breathe-btn");

    if (!isBreathing) {
        isBreathing = true;
        if (btn) btn.innerText = "Stop Breathing";
        runBreathingCycle(circle, text);
        breathingInterval = setInterval(() => runBreathingCycle(circle, text), 8000);
    } else {
        stopBreathing();
    }
};

function runBreathingCycle(circle, text) {
    if (!isBreathing) return;
    if (text) text.innerText = "Breathe In...";
    if (circle) circle.classList.add("expand");

    setTimeout(() => {
        if (!isBreathing) return;
        if (text) text.innerText = "Breathe Out...";
        if (circle) circle.classList.remove("expand");
    }, 4000);
}

function stopBreathing() {
    isBreathing = false;
    clearInterval(breathingInterval);
    const circle = document.getElementById("circle");
    const text = document.getElementById("breathing-text");
    const btn = document.getElementById("breathe-btn");

    if (circle) circle.classList.remove("expand");
    if (text) text.innerText = "Ready";
    if (btn) btn.innerText = "Start Breathing";
}

function updateStats() {
    const entries = JSON.parse(localStorage.getItem("soluna_journal")) || [];
    const moodHistory = JSON.parse(localStorage.getItem("soluna_mood_history")) || [];

    const totalEntriesEl = document.getElementById("stat-total-entries");
    const totalMoodsEl = document.getElementById("stat-total-moods");
    const streakBadge = document.getElementById("streak-badge");

    if (totalEntriesEl) totalEntriesEl.innerText = entries.length;
    if (totalMoodsEl) totalMoodsEl.innerText = moodHistory.length;
    if (streakBadge) streakBadge.innerText = `🔥 ${moodHistory.length} Streak`;
}