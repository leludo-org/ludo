// Cheeky bot name pools — harmless, region-flavoured.

export const BOT_NAME_POOLS = {
    english: [
        "Capt Obv", "Whiffs", "Boomer", "Karen", "Reply Guy",
        "Speedrun", "Tilt Tim", "Salty Sam", "AFK Andy", "Lag Larry",
        "McBotface", "Mid Skill", "Sweatlord", "Mid Boss", "Side Qst",
        "Toaster", "NPC Vibe", "Backseat", "Loot Gob", "Edge Lord",
        "Sir Yeets", "Grass Up", "GG Gary", "Goblin", "Cope Lord",
        "Doomscrl", "Sketchy", "Cringe", "Vibechk", "Bonk Bot",
        "Tiltpilot", "Misclicks", "Side Eye", "Pog Champ", "Patchnote",
        "Dial-up", "TouchStrm", "Whoopsie", "Cope Hard", "Ratio'd",
        "WiFi Wal", "404 Brian", "CacheMiss", "Stacktrc",
        "Null Ptr", "Off-By-1", "Hard F5", "ForceQuit",
    ],
    hindi: [
        "Pappu", "Bantai", "Chacha", "Chatur", "Bhidu", "Munna",
        "Ghonchu", "Gabbar", "Lukkha", "Topibaaz", "Jugaadu", "Fattu", "Dabangg",
        "Chamcha", "Chhotu", "Lallu", "Bewakoof", "Chillar", "Champak", "Hawabaaz",
        "Pheku", "Tubelight", "Tharki", "Jhakaas", "Bhau",
        "Mota Bhai", "DaruSingh", "Gappu", "Tingu",
        "Sachin No", "Sasta SRK", "Free WiFi", "Ctrl+Bhej", "404 Bhai",
        "Auto Raja", "Panmasala", "Fwd2All",
        "ChaiSutta", "Maggi 2m", "FltrCofi", "AdrakLasi",
        "InstaReel", "DJ Babu", "No Helmet", "Rikshaw",
        "WA Status", "Fwd Karo", "Net Khtm", "Buffer",
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

const SEAT_NAME_KEY = "seat-names";

function readSeatNameMap() {
    try {
        const raw = localStorage.getItem(SEAT_NAME_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function getSavedSeatName(type, seatIndex) {
    const map = readSeatNameMap();
    return map[`${type}.${seatIndex}`] || "";
}

export function setSavedSeatName(type, seatIndex, name) {
    const map = readSeatNameMap();
    const key = `${type}.${seatIndex}`;
    if (name) map[key] = name;
    else delete map[key];
    localStorage.setItem(SEAT_NAME_KEY, JSON.stringify(map));
}
