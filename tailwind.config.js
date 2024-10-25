/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./*.{html,js}",
    ],
    theme: {
        extend: {
            colors: {
                "background": "hsl(var(--background))",
                "player-1": "hsl(var(--player-1))",
                "player-2": "hsl(var(--player-2))",
                "player-3": "hsl(var(--player-3))",
                "player-4": "hsl(var(--player-4))"
            }
        },
    },
    plugins: [],
}

