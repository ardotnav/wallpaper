# Auto-Updating Year Progress Wallpaper

A serverless function that generates a daily wallpaper showing your year progress, styled as an illuminated manuscript: a lapis lazuli background, gold-leaf cells for the days you've lived, a candle-glow marker on today, and the year percentage in Roman capitals — framed like a plate from a Renaissance codex.

## Features

- **Auto-updating**: Generates a fresh image on each request based on the current date
- **Year Progress Grid**: 14 columns × 26-27 rows of gilded cells representing all days of the year
- **Today Marker**: The current day glows in bright gold so you can find yourself in the year
- **Year Percentage**: Set in Cinzel (Trajan-style Roman capitals) below the grid
- **Daily Quote**: A rotating motivational quote set in italic EB Garamond
- **Bundled Typography**: Fonts ship with the function (no system fonts needed on the server)
- **Customizable Accent**: Pass `?accent=RRGGBB` to change the today-marker color
- **iPhone Optimized**: Image dimensions optimized for iPhone wallpapers (1170×2532)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Deploy the project:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project and deploy.

4. Note your deployment URL (e.g., `https://your-project.vercel.app`)

### 3. Test the Endpoint

Visit `https://your-project.vercel.app/api/wallpaper` in your browser to see the generated wallpaper.

## iPhone Shortcut Setup

### Create the Shortcut

1. Open the **Shortcuts** app on your iPhone
2. Tap the **+** button to create a new shortcut
3. Add the following actions:

   **Action 1: Get Contents of URL**
   - URL: `https://your-project.vercel.app/api/wallpaper`
   - Method: GET

   **Action 2: Set Wallpaper**
   - Image: (Result from previous action)
   - Show Preview: Off (optional)
   - Apply to: Lock Screen, Home Screen, or Both

4. Name your shortcut (e.g., "Update Year Wallpaper")
5. Save the shortcut

### Set Up Daily Automation

1. In the Shortcuts app, go to the **Automation** tab
2. Tap **+** to create a new automation
3. Select **Time of Day**
4. Choose a time (e.g., 12:00 AM) and set it to run daily
5. Add action: **Run Shortcut**
6. Select your wallpaper shortcut
7. Turn off **Ask Before Running** (optional, for fully automatic updates)
8. Save the automation

Now your wallpaper will automatically update every day!

## How It Works

- The API endpoint calculates the current day of the year
- It generates a grid where each rounded cell represents one day
- Days that have passed are gilded (each cell's gold shimmer varies slightly, like real leaf), future days sit in lapis shadow, and today glows brightest
- Month-end cells carry a subtle month initial
- The year percentage and a daily quote sit below the framed grid
- Text renders with TTFs bundled in `assets/fonts` (registered via fontconfig at cold start); if the fonts are missing, a built-in shape-based text renderer takes over
- The image is generated fresh on each request, so it's always up to date

## Customization

Quick accent color change without touching code — add a query param to the URL in your Shortcut:

```
https://your-project.vercel.app/api/wallpaper?accent=7DD3FC
```

For deeper changes, edit `DEFAULT_CONFIG` in `utils/wallpaperGenerator.js`:

- **Colors**: background gradient, cell colors, accent, text and quote colors
- **Grid density**: `cols` (days per row)
- **Spacing**: paddings and layout spaces
- **Image dimensions**: `width` and `height`

## Technical Details

- Built with Node.js; SVG generated in code and rasterized to PNG with sharp
- Deployed as a Vercel serverless function
- Image generated on-demand (no storage needed)
- Handles leap years automatically
- Optimized for iPhone wallpaper dimensions
