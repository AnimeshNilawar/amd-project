# Smart Food Advisor

Smart Food Advisor is a client-side Next.js application that analyzes a food name or food image and returns an AI-generated health assessment in real time. It uses Google Gemini for structured food understanding, then presents the result in a clean, demo-friendly interface with health scoring, macronutrient bars, and goal-aware advice.

## Live Experience

Users can:

- Enter a food name such as `pepperoni pizza` or `quinoa salad`
- Upload a food image from their device
- Choose a personal goal:
  - Weight Loss
  - Muscle Gain
  - General Health
- Receive a structured analysis from Gemini in seconds
- See a fallback analysis if the live AI response fails or returns invalid JSON

## What Makes It Useful

The app is not just a chatbot wrapper. It tries to turn raw food input into something judges can quickly understand:

- A clear health score from 0 to 100
- Estimated calories
- Protein, carbs, and fat estimates
- A healthy or not healthy indicator
- A better alternative suggestion
- Short advice tailored to the selected goal

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini API
- lucide-react icons

## How It Works

### 1. User enters a food input

The main interface lives in `src/components/FoodAdvisor.tsx`. It supports two input modes:

- text input for food names
- image upload for food photos

If an image is selected, the browser reads it with `FileReader` and converts it to a base64 data URL.

### 2. The selected goal is included in the request

The app lets the user choose one of three goals:

- Weight Loss
- Muscle Gain
- General Health

That goal is passed into the Gemini prompt so the response is contextual, not generic.

### 3. Gemini is called directly from the client

The request is sent from the browser to Gemini using the `NEXT_PUBLIC_GEMINI_API_KEY` environment variable.

The prompt instructs Gemini to return strict JSON containing:

- `food_name`
- `calories`
- `macronutrients`
- `health_score`
- `is_healthy`
- `better_alternative`
- `actionable_advice`

The model currently used is `gemini-3-flash-preview`.

### 4. The response is parsed and validated

The AI response is cleaned and parsed in `src/lib/parseResponse.ts`.

If Gemini returns extra markdown or slightly malformed output, the parser strips common wrapping before calling `JSON.parse`.

### 5. A fallback analysis is shown if Gemini fails

If the API request fails or the response cannot be parsed, the app does not stop working.

Instead, it uses a small rule-based fallback system that estimates values from known food keywords and generates goal-specific advice. This keeps the demo stable even with network issues or unexpected API output.

### 6. The result is displayed in a polished card UI

`src/components/AnalysisResult.tsx` renders the result with:

- a large health score
- color-coded status
- calories summary
- macronutrient progress bars
- short advice text
- a better alternative section when the food is not considered healthy

## Project Structure

- `src/app/page.tsx` - main landing page and hero section
- `src/app/layout.tsx` - root layout and font setup
- `src/app/globals.css` - Tailwind theme tokens and glassmorphism styling
- `src/components/FoodAdvisor.tsx` - input form, upload handling, and request flow
- `src/components/AnalysisResult.tsx` - result presentation UI
- `src/lib/geminiClient.ts` - Gemini API request helper
- `src/lib/parseResponse.ts` - JSON parsing and fallback analysis

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy the example file and add your Gemini API key:

```bash
copy .env.example .env.local
```

Then set the key:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

> Important: because this is a client-side only demo, any key in `NEXT_PUBLIC_*` is exposed in the browser at runtime. That is acceptable for a hackathon MVP, but it is not appropriate for a production app.

### 3. Run the app

```bash
npm run dev
```

Open the local app in your browser and try a food name or upload a photo.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the built app
- `npm run lint` - run ESLint

## Docker

The project includes a multistage Dockerfile for building a small production image.

Because the app uses `NEXT_PUBLIC_GEMINI_API_KEY`, the key must be available at build time so Next.js can inline it into the client bundle.

### Build the image

```bash
docker build --build-arg NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here -t smart-food-advisor .
```

### Run the container

```bash
docker run -p 3000:3000 smart-food-advisor
```

Then open [http://localhost:3000](http://localhost:3000).

## Demo Flow for Judges

A short demo usually works best:

1. Open the app home page
2. Enter a food item such as `pepperoni pizza`
3. Choose a goal, for example `Weight Loss`
4. Upload a food image or keep it text-only
5. Click `Analyze Food`
6. Show the AI response card, health score, and macro bars
7. Point out the fallback behavior if you intentionally disconnect the API key or return invalid JSON

## Design Notes

The UI is intentionally high-contrast and cinematic so it reads well in a live demo:

- dark glassmorphism panels
- green brand accents for health and action
- large hero typography
- clear result cards and progress indicators
- minimal friction between input and analysis

## Security Note

This project is designed as a rapid prototype. It does not include a backend proxy, auth, or database.

For a production version, the Gemini request should be proxied through a server so the API key is never exposed in the browser.

## Why This Project Works Well in a Hackathon

- It is easy to understand in under a minute
- It gives judges a visible AI outcome immediately
- It supports both text and image input
- It has a graceful fallback instead of failing hard
- It feels complete without requiring heavy infrastructure

## Local Verification

The current codebase builds successfully with:

```bash
npm run build
```

And linting passes with:

```bash
npm run lint
```

## License

No license has been added to this repository yet.
