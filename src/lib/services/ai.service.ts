import OpenAI from "openai";
import type {
  AnalyzeMealRequest,
  AnalyzeMealResponse,
  RefineMealRequest,
  TDEECalculationRequest,
  TDEECalculationResponse,
  GoalTargets,
} from "../../types";
import type { Json } from "../../db/database.types";

/**
 * AI Service for meal analysis and TDEE calculations using OpenRouter (grok-4.1-fast)
 */
export class AiService {
  private client: OpenAI;
  private model = "x-ai/grok-4.1-fast";
  private language = "Polish";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is required");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  /**
   * Analyzes a meal from text description and/or images
   */
  async analyzeMeal(request: AnalyzeMealRequest): Promise<AnalyzeMealResponse> {
    const systemPrompt = this.buildMealAnalysisSystemPrompt();
    const userContent = this.buildMealAnalysisUserContent(request);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(content);
      return this.validateMealAnalysisResponse(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON format");
      }
      throw error;
    }
  }

  /**
   * Refines a previously analyzed meal based on user corrections
   */
  async refineMeal(request: RefineMealRequest): Promise<AnalyzeMealResponse> {
    const systemPrompt = this.buildMealAnalysisSystemPrompt();
    const userContent = this.buildRefinementUserContent(request);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(content);
      return this.validateMealAnalysisResponse(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("AI returned invalid JSON format");
      }
      throw error;
    }
  }

  /**
   * Calculates TDEE and suggests macronutrient targets
   * Uses hybrid approach: mathematical calculation + AI suggestions
   */
  async calculateTDEE(request: TDEECalculationRequest): Promise<TDEECalculationResponse> {
    // Step 1: Calculate BMR using Mifflin-St Jeor equation
    const bmr = this.calculateBMR(request.gender, request.weight_kg, request.height_cm, request.age);

    // Step 2: Calculate TDEE based on activity level
    const tdee = this.calculateTDEEFromBMR(bmr, request.activity_level);

    // Step 3: Ask AI for macronutrient distribution suggestions
    const suggestedTargets = await this.getSuggestedMacroTargets(request, tdee);

    return {
      bmr,
      tdee,
      suggested_targets: suggestedTargets,
    };
  }

  /**
   * Calculates Basal Metabolic Rate using Mifflin-St Jeor equation
   */
  private calculateBMR(gender: string, weight: number, height: number, age: number): number {
    // Mifflin-St Jeor Equation:
    // Men: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
    // Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
    const baseBMR = 10 * weight + 6.25 * height - 5 * age;
    return gender.toLowerCase() === "male" ? baseBMR + 5 : baseBMR - 161;
  }

  /**
   * Calculates TDEE from BMR based on activity level
   */
  private calculateTDEEFromBMR(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const multiplier = multipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Uses AI to suggest optimal macronutrient distribution
   */
  private async getSuggestedMacroTargets(request: TDEECalculationRequest, tdee: number): Promise<GoalTargets> {
    const systemPrompt = `You are a professional nutritionist and dietitian.
Your task is to suggest optimal macronutrient targets for a person based on their TDEE and profile.
Always respond with valid JSON only, no additional text.

IMPORTANT: Always respond in ${this.language} language for the explanation field.

Required JSON format:
{
  "calories": number,
  "protein": number (in grams),
  "fat": number (in grams),
  "carbs": number (in grams),
  "fiber": number (in grams),
  "explanation": "Brief explanation of your recommendations"
}`;

    const userPrompt = `Person's profile:
- Gender: ${request.gender}
- Weight: ${request.weight_kg} kg
- Height: ${request.height_cm} cm
- Age: ${request.age} years
- Activity Level: ${request.activity_level}
- Calculated TDEE: ${tdee} kcal

Suggest optimal macronutrient targets. Consider:
- Protein: 1.6-2.2g per kg body weight for active individuals
- Fat: 20-35% of total calories
- Carbs: remaining calories
- Fiber: 25-35g daily

Respond with JSON only.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(content);
      return {
        calories: parsed.calories || tdee,
        protein: parsed.protein || Math.round((tdee * 0.3) / 4),
        fat: parsed.fat || Math.round((tdee * 0.25) / 9),
        carbs: parsed.carbs || Math.round((tdee * 0.45) / 4),
        fiber: parsed.fiber || 30,
      };
    } catch {
      // Fallback to standard distribution if AI fails
      return {
        calories: tdee,
        protein: Math.round((tdee * 0.3) / 4), // 30% protein
        fat: Math.round((tdee * 0.25) / 9), // 25% fat
        carbs: Math.round((tdee * 0.45) / 4), // 45% carbs
        fiber: 30,
      };
    }
  }

  /**
   * Builds system prompt for meal analysis
   */
  private buildMealAnalysisSystemPrompt(): string {
    return `You are a professional nutritionist and dietitian assistant in MacroSpy app.
Your task is to analyze meals and provide accurate nutritional information.

IMPORTANT: Always respond in ${this.language} language for all text fields including name, assistant_response, and dietary_suggestion.

CRITICAL: Always respond with valid JSON only, no additional text or markdown.

Required JSON format:
{
  "name": "descriptive meal name",
  "calories": number,
  "protein": number (grams),
  "fat": number (grams),
  "carbs": number (grams),
  "fiber": number (grams, estimate if unknown),
  "assistant_response": "friendly, conversational response to user",
  "dietary_suggestion": "brief health tip or dietary advice",
  "portions": [
    {
      "item": "food item name",
      "quantity": "amount with unit",
      "calories": number,
      "protein": number,
      "fat": number,
      "carbs": number,
      "fiber": number
    }
  ]
}

Guidelines:
- Be precise with nutritional values based on standard food databases
- If portions/amounts are unclear, make reasonable assumptions and mention in assistant_response
- Fiber should be estimated (never null or 0)
- assistant_response should be warm and encouraging
- dietary_suggestion should be practical and helpful
- Break down composite meals into individual portions when possible`;
  }

  /**
   * Builds user content for meal analysis (text + optional images)
   */
  private buildMealAnalysisUserContent(request: AnalyzeMealRequest): OpenAI.Chat.ChatCompletionContentPart[] {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: `Analyze this meal: ${request.text_prompt}`,
      },
    ];

    if (request.images && request.images.length > 0) {
      for (const imageBase64 of request.images) {
        content.push({
          type: "image_url",
          image_url: {
            url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
          },
        });
      }
    }

    return content;
  }

  /**
   * Builds user content for meal refinement
   */
  private buildRefinementUserContent(request: RefineMealRequest): string {
    return `Previous analysis:
${JSON.stringify(request.previous_context, null, 2)}

User's correction/clarification:
${request.correction_prompt}

Please provide updated nutritional analysis based on the correction. Respond with JSON only.`;
  }

  /**
   * Validates and transforms AI response to match expected format
   */
  private validateMealAnalysisResponse(parsed: unknown): AnalyzeMealResponse {
    // Type guard for parsed response
    const response = parsed as {
      name?: string;
      calories?: number;
      protein?: number;
      fat?: number;
      carbs?: number;
      fiber?: number;
      assistant_response?: string;
      dietary_suggestion?: string;
    };

    // Ensure all required fields are present
    if (!response.name || typeof response.calories !== "number") {
      throw new Error("Invalid AI response format: missing required fields");
    }

    return {
      name: response.name,
      calories: Math.max(0, response.calories),
      protein: Math.max(0, response.protein || 0),
      fat: Math.max(0, response.fat || 0),
      carbs: Math.max(0, response.carbs || 0),
      fiber: Math.max(0, response.fiber || 0),
      assistant_response: response.assistant_response || "Meal analyzed successfully!",
      dietary_suggestion: response.dietary_suggestion || "Keep up the healthy eating!",
      ai_context: parsed as Json, // Store full context for potential refinement
    };
  }
}

/**
 * Creates an instance of AiService with environment configuration
 */
export function createAiService(): AiService {
  const apiKey = import.meta.env.PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  return new AiService(apiKey);
}
