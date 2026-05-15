/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./changelog.html",
        "./privacy.html",
        "./components/**/*.js",
        "./scripts/**/*.js",
    ],
    darkMode: 'class',
    safelist: [
        { pattern: /(bg|text|border|ring|fill|stroke)-player-[0-3](-light|-path)?/ },
    ],
    theme: {
        extend: {
            colors: {
                "border": 'hsl(var(--border))',
                "background": "hsl(var(--background))",
                "foreground": "hsl(var(--foreground))",
                "card": "hsl(var(--card))",
                "player-0": "hsl(var(--player-0))",
                "player-1": "hsl(var(--player-1))",
                "player-2": "hsl(var(--player-2))",
                "player-3": "hsl(var(--player-3))",
                "card-hover": "hsl(var(--card-hover))",
                "player-0-light": "hsl(var(--player-0-light))",
                "player-1-light": "hsl(var(--player-1-light))",
                "player-2-light": "hsl(var(--player-2-light))",
                "player-3-light": "hsl(var(--player-3-light))",
                "player-0-path": "hsl(var(--player-0-path))",
                "player-1-path": "hsl(var(--player-1-path))",
                "player-2-path": "hsl(var(--player-2-path))",
                "player-3-path": "hsl(var(--player-3-path))",
                "safe-tint": "hsl(var(--safe-tint))",
                "board-cell": "hsl(var(--board-cell))",
                "board-border": "hsl(var(--board-border))"
            },
            fontFamily: {
                "display": ['"Instrument Serif"', 'Georgia', 'serif'],
                "sans": ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                "mono": ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
            }
        },
    },
    plugins: [],
}

