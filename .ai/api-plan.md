# REST API Plan for MacroSpy

This document outlines the REST API architecture for MacroSpy. The API is implemented using **Astro 5 API Routes** (`src/pages/api/`), acting as a Backend-for-Frontend (BFF) layer. It interacts with **Supabase** (PostgreSQL) for data persistence and external AI services (**OpenRouter/Grok**) for intelligence.

## 1. Resources

| Resource         | DB Table            | Description                                          |
| :--------------- | :------------------ | :--------------------------------------------------- |
| **Profile**      | `profiles`          | User bio-data (height, gender, DOB) linked to Auth.  |
| **Goals**        | `dietary_goals`     | Historic and current nutritional targets.            |
| **Meals**        | `meals`             | Food entries with macro data.                        |
| **AI Analysis**  | N/A (Stateless)     | Ephemeral resource for analyzing text/images via AI. |
| **Measurements** | `body_measurements` | Weight and body composition logs.                    |

---

## 2. Endpoints

### 2.1. AI Services (Core Logic)

These endpoints handle the interaction with the LLM (grok-4.1-fast). They do not write to the database directly but return structured data for the user to review.

#### **Analyze Meal**

Analyzes text or images to estimate macros.

- **Method:** `POST`
- **URL:** `/api/ai/analyze`
- **Description:** Takes text prompt and/or image base64, sends to AI, returns estimated macros, assistant commentary, and passive suggestions.
- **Request Body:**
  ```json
  {
    "text_prompt": "Jajecznica z 3 jaj na maśle",
    "images": ["base64_string..."] // Optional
  }
  ```
- **Response Body:**
  ```json
  {
    "name": "Jajecznica na maśle",
    "calories": 350,
    "protein": 18.5,
    "fat": 28.0,
    "carbs": 1.2,
    "fiber": 0.5,
    "assistant_response": "Przyjąłem, że użyłeś 3 jajek klasy M oraz około 10g masła. To solidny posiłek białkowo-tłuszczowy, idealny na start dnia.",
    "dietary_suggestion": "Dodaj pomidora lub garść szpinaku, aby zwiększyć objętość posiłku bez dodawania wielu kalorii.",
    "ai_context": { ... } // Token needed for follow-up conversation
  }
  ```

#### **Refine Meal (Chat)**

Allows the user to correct the AI's estimation via natural language.

- **Method:** `POST`
- **URL:** `/api/ai/refine`
- **Description:** Takes previous context and a correction prompt to recalculate macros.
- **Request Body:**
  ```json
  {
    "previous_context": { ... }, // From previous analysis response
    "correction_prompt": "Bez masła, na oleju kokosowym"
  }
  ```
- **Response Body:** Same structure as `/api/ai/analyze` (updates macros, response, and suggestion).

#### **Calculate TDEE**

Calculates caloric needs based on biometrics (Onboarding).

- **Method:** `POST`
- **URL:** `/api/ai/calculate-tdee`
- **Description:** Stateless calculator using standard formulas (Mifflin-St Jeor) and AI suggestions for macro splits.
- **Request Body:**
  ```json
  {
    "gender": "male",
    "weight_kg": 80,
    "height_cm": 180,
    "age": 30,
    "activity_level": "moderate"
  }
  ```
- **Response Body:**
  ```json
  {
    "bmr": 1850,
    "tdee": 2867,
    "suggested_targets": {
      "calories": 2500,
      "protein": 180,
      "fat": 80,
      "carbs": 265,
      "fiber": 35
    }
  }
  ```

---

### 2.2. Meals (Journal)

#### **List Meals**

- **Method:** `GET`
- **URL:** `/api/meals`
- **Query Params:** `?date=YYYY-MM-DD` (Defaults to today)
- **Response Body:**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Jajecznica",
        "calories": 350,
        "protein": 18.5,
        "fat": 28.0,
        "carbs": 1.2,
        "fiber": 0.5,
        "ai_suggestion": "Dodaj pomidora lub garść szpinaku...",
        "consumed_at": "2026-01-06T08:30:00Z"
      }
    ],
    "summary": {
      "total_calories": 1250,
      "total_protein": 80,
      "total_fat": 50,
      "total_carbs": 120,
      "total_fiber": 15
    }
  }
  ```

#### **Create Meal**

- **Method:** `POST`
- **URL:** `/api/meals`
- **Description:** Saves a verified meal to the database.
- **Request Body:**
  ```json
  {
    "name": "Jajecznica",
    "consumed_at": "2026-01-06T08:30:00Z",
    "calories": 350,
    "protein": 18.5,
    "fat": 28.0,
    "carbs": 1.2,
    "fiber": 0.5,
    "ai_suggestion": "Dodaj pomidora lub garść szpinaku...", // Optional, passed from analysis
    "original_prompt": "...",
    "last_ai_context": { ... },
    "is_image_analyzed": false
  }
  ```
- **Response:** `201 Created` with created object.

#### **Update Meal**

- **Method:** `PATCH`
- **URL:** `/api/meals/[id]`
- **Request Body:** Partial meal object (e.g., changing time or macros including `fiber`).
- **Response:** `200 OK`.

#### **Delete Meal**

- **Method:** `DELETE`
- **URL:** `/api/meals/[id]`
- **Response:** `204 No Content`.

---

### 2.3. Dietary Goals & Profile

#### **Get Current Profile & Goal**

- **Method:** `GET`
- **URL:** `/api/profile/me`
- **Description:** Returns user bio-data and the _currently active_ dietary goal.
- **Response Body:**
  ```json
  {
    "profile": { "height": 180, "gender": "male", "birth_date": "1995-01-01" },
    "current_goal": {
      "calories_target": 2500,
      "protein_target": 180,
      "fat_target": 80,
      "carbs_target": 265,
      "fiber_target": 35,
      "start_date": "2026-01-01"
    }
  }
  ```

#### **Update Profile (Bio-data)**

- **Method:** `PUT`
- **URL:** `/api/profile`
- **Request Body:**
  ```json
  {
    "height": 180,
    "gender": "male",
    "birth_date": "1995-05-12"
  }
  ```

#### **Set New Dietary Goal**

- **Method:** `POST`
- **URL:** `/api/goals`
- **Description:** Creates a new entry in `dietary_goals` effective from a specific date.
- **Request Body:**
  ```json
  {
    "start_date": "2026-01-07",
    "calories_target": 2400,
    "protein_target": 180,
    "fat_target": 70,
    "carbs_target": 250,
    "fiber_target": 35
  }
  ```

---

### 2.4. Body Measurements

#### **List Measurements**

- **Method:** `GET`
- **URL:** `/api/measurements`
- **Query Params:** `?limit=30` (default)
- **Response Body:** Array of measurement objects sorted by date DESC.

#### **Log Measurement**

- **Method:** `POST`
- **URL:** `/api/measurements`
- **Request Body:**
  ```json
  {
    "date": "2026-01-06",
    "weight": 80.5,
    "body_fat_percentage": 15.2, // Optional
    "muscle_percentage": 42.0 // Optional
  }
  ```

#### **Delete Measurement**

- **Method:** `DELETE`
- **URL:** `/api/measurements/{id}`
- **Response:** `204 No Content`
- **Description:** Usuwa pomiar ciała. Wymaga autoryzacji - tylko właściciel może usunąć swój pomiar.

---

## 3. Authentication & Authorization

- **Mechanism:** Supabase Auth (JWT).
- **Implementation:**
  - Clients send `Authorization: Bearer <access_token>` header.
  - Astro Middleware (`src/middleware/index.ts`) verifies the token using `supabase.auth.getUser()`.
  - `user_id` is extracted from the session and enforced in all DB queries (Row Level Security is active in Supabase, but the API layer adds a second validation check).
- **Error Handling:**
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Accessing resource belonging to another user (prevented by RLS).

---

## 4. Validation & Business Logic

### 4.1. Validation Rules (Zod Schemas)

All incoming requests will be validated using **Zod** before processing.

- **Global:**
  - Date strings must be ISO 8601.
  - Numeric IDs must be valid UUIDs.
- **Meals:**
  - `calories`, `protein`, `fat`, `carbs`, `fiber` must be >= 0.
  - `name` cannot be empty.
- **Goals:**
  - Targets (calories, protein, fat, carbs) must be positive integers.
  - `fiber_target` must be >= 0 (nullable allowed in DB, but API should enforce non-negative if provided).
- **Measurements:**
  - `weight` > 0.
  - Percentages must be between 0 and 100.

### 4.2. Business Logic Implementation

1.  **AI Analysis Integration:**
    - The API acts as a proxy to OpenRouter/Grok.
    - System prompts are stored in `src/lib/ai/prompts.ts` to ensure consistent JSON output from the LLM (always including fiber field).
    - Images are processed as base64 strings and passed to the Vision capabilities of the model.

2.  **Active Goal Resolution:**
    - Logic: To find the goal for a specific date (usually today), query `dietary_goals` where `start_date <= current_date` order by `start_date DESC` limit 1.
    - This logic resides in a helper service `src/lib/services/goal.service.ts`.

3.  **Data Aggregation:**
    - The `/api/meals` endpoint does not just return rows; it sums up the macros (including fiber) for the requested day server-side to ensure the dashboard receives ready-to-render data.

4.  **Security/Rate Limiting:**
    - Since AI calls are expensive, `/api/ai/*` endpoints should have server-side rate limiting (e.g., using Upstash or a simple in-memory map if single instance) to prevent abuse.
