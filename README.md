# MacroSpy

**MacroSpy** is an intelligent, RWD web application (PWA capable) designed to simplify the process of monitoring food intake and nutritional values. By leveraging artificial intelligence (specifically the `grok-4.1-fast` model), MacroSpy allows users to log meals via text, voice, or photos, automatically calculating macros and removing the friction of manual data entry.

## Project Description

Traditional calorie counting apps often lead to user burnout due to the tedious nature of weighing ingredients and searching databases. MacroSpy acts as a personal nutrition assistant that understands natural language (e.g., "I ate a large margherita pizza") and visual inputs, estimating portions and nutritional content instantly.

**Key Goals:**

- Maximize simplicity in meal logging.
- Provide immediate feedback via daily progress bars.
- Enable interactive dialogue with AI for precise meal corrections.

## Tech Stack

### Frontend

- **Framework**: [Astro 5](https://astro.build/) (Server-first, performance focused)
- **Interactivity**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)

### Backend & AI

- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **AI Integration**: [OpenRouter.ai](https://openrouter.ai/) (Access to LLMs)

### Testing & Quality Assurance

- **Unit & Integration Testing**: [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **End-to-End Testing**: [Playwright](https://playwright.dev/)
- **Code Quality**: ESLint, Prettier, Husky (pre-commit hooks)

### Infrastructure

- **CI/CD**: GitHub Actions
- **Hosting**: DigitalOcean (Dockerized)

## Getting Started Locally

### Prerequisites

- Node.js **v22.14.0** or higher (see `.nvmrc`).
- A Supabase project.
- An OpenRouter API key.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pwoszkowski/MacroSpy.git
    cd MacroSpy
    ```

2.  **Set up Node.js version:**
    If you use `nvm`:

    ```bash
    nvm use
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Environment Configuration:**
    Create a `.env` file in the root directory based on your backend configuration. You will likely need:

    ```env
    PUBLIC_SUPABASE_URL=your_supabase_url
    PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OPENROUTER_API_KEY=your_openrouter_key
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app should be available at `http://localhost:4321`.

## Available Scripts

| Script             | Description                                         |
| :----------------- | :-------------------------------------------------- |
| `npm run dev`      | Starts the local development server with Astro.     |
| `npm run build`    | Builds the production-ready site.                   |
| `npm run preview`  | Previews the built production site locally.         |
| `npm run lint`     | Runs ESLint to check for code quality issues.       |
| `npm run lint:fix` | Runs ESLint and automatically fixes fixable issues. |
| `npm run format`   | Formats code using Prettier.                        |
| `npm test`         | Runs unit and integration tests with Vitest.        |
| `npm run test:e2e` | Runs end-to-end tests with Playwright.              |

## Project Scope

### Core Features (MVP)

- **Authentication**: Email/Password registration and login.
- **Onboarding**: Automatic TDEE/BMR calculation and goal setting.
- **Multimodal Logging**: Simultaneous text and photo processing for meal identification.
- **AI Analysis**: Usage of `grok-4.1-fast` to identify ingredients and grammage.
- **Interactive Chat**: Correction mode to refine AI estimates (e.g., "Change chicken to tofu").
- **Dashboard**: Real-time progress bars for Calories, Protein, Fats, and Carbs.
- **History**: Daily meal history and management (Edit/Delete).

### Out of Scope (MVP)

- Meal planning and shopping lists.
- Workout tracking/integration.
- Long-term AI memory (context resets daily).
- Social logins (Google/Facebook).
- 3rd party integrations (Apple Health/Google Fit).

## Project Status

🚧 **In Development** (Version 0.0.1)

## License

This project is proprietary. All rights reserved.
