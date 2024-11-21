/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{html,js}",
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
                "player-3": "hsl(var(--player-3))"
            }
        },
    },
    plugins: [],
}

