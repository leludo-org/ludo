// Bakchod bot name pools — cheeky, harmless, region-flavoured.

export const BOT_NAME_POOLS = {
    english: [
        "Cap Obvious", "Sir Whiffs", "Boomer", "Karen", "Reply Guy",
        "Speedrun", "Tilted Tim", "Salty Sam", "AFK Andy", "Lag Larry",
        "McBotface", "Skill Issue", "Sweatlord", "Mid Boss", "Side Quest",
        "Toaster", "NPC Energy", "Backseat", "Loot Goblin", "Edge Lord",
        "Sir Loses", "Touch Grass", "GG Gary", "Goblin Mode", "Cope Lord",
        "Yikes Mike", "Doomscroll", "Sketchy", "Wholesome", "Karen 2.0",
        "Big Yikes", "Misclicks", "Casual Carl", "Throws Lot", "Lag-a-lot",
        "Lord Buffer", "Dial-up Dan", "Pixel Push", "Lukewarm", "Whoopsie",
        "Sad Toast", "Lukey", "Wi-Fi Wally", "404 Brian",
    ],
    hindi: [
        "Bakchod", "Pappu", "Bantai", "Chacha", "Chatur", "Bhidu", "Munna",
        "Ghonchu", "Gabbar", "Lukkha", "Topibaaz", "Jugaadu", "Fattu", "Dabangg",
        "Chamcha", "Chhotu", "Lallu", "Bewakoof", "Chillar", "Champak", "Hawabaaz",
        "Pheku", "Tubelight", "Sookha", "Tharki", "Jhakaas", "Bhau",
        "Mota Bhai", "Daru Singh", "Gappu", "Bantu", "Bunty", "Gulshan", "Tingu",
        "Sachin Nahi", "Sasta SRK", "Free Wi-Fi", "Ctrl+Bhej", "404 Bhai",
        "Auto Wala", "Pan Masala", "Auto Raja", "WhatsApp", "Fwd to All",
    ],
};

export const BOT_POOL_LABELS = {
    english: "English",
    hindi: "Hindi / Hinglish",
};

const POOL_KEY = "bot-name-pool";

export function getActivePoolKey() {
    const stored = localStorage.getItem(POOL_KEY);
    if (stored && BOT_NAME_POOLS[stored]) return stored;
    return "english";
}

export function setActivePoolKey(key) {
    if (!BOT_NAME_POOLS[key]) return;
    localStorage.setItem(POOL_KEY, key);
    document.dispatchEvent(new CustomEvent("bot-name-pool-changed", { detail: { key } }));
}

export function randomBotName(used = []) {
    const pool = BOT_NAME_POOLS[getActivePoolKey()];
    const available = pool.filter(n => !used.includes(n));
    const source = available.length ? available : pool;
    return source[Math.floor(Math.random() * source.length)];
}

export function isDefaultBotName(name) {
    return Object.values(BOT_NAME_POOLS).some(pool => pool.includes(name));
}
