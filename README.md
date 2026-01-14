# Auto-Updating Year Progress Wallpaper

A serverless function that generates a daily wallpaper showing your year progress. The wallpaper displays a 7×52/53 grid of circles (one for each day of the year) with filled circles for days that have passed and a year percentage tracker at the bottom.

## Features

- **Auto-updating**: Generates a fresh image on each request based on the current date
- **Year Progress Grid**: 7 columns × 52-53 rows representing all days of the year
- **Visual Progress**: Filled circles for passed days, empty circles for future days
- **Year Percentage**: Displays current year progress percentage at the bottom
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
- It generates a grid where each circle represents one day
- Circles are filled for days that have passed (1 to current day)
- Empty circles represent future days
- The year progress percentage is calculated and displayed at the bottom
- The image is generated fresh on each request, so it's always up to date

## Customization

You can customize the appearance by editing `api/wallpaper.js`:

- **Colors**: Change `fillStyle` and `strokeStyle` values
- **Circle size**: Adjust `circleRadius` multiplier
- **Font size**: Modify the font size calculation for the percentage text
- **Image dimensions**: Change `width` and `height` values

## Technical Details

- Built with Node.js and Canvas library
- Deployed as a Vercel serverless function
- Image generated on-demand (no storage needed)
- Handles leap years automatically
- Optimized for iPhone wallpaper dimensions
