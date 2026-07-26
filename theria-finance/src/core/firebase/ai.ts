import { GoogleAIBackend, getAI, getGenerativeModel, type GenerativeModel } from 'firebase/ai';
import { getFirebaseApp } from './app';

/**
 * A flash-class model: Terry summarises rather than reasons deeply, so speed
 * and free-tier allowance matter more than raw capability. Kept in one place
 * because model ids get retired — `gemini-2.5-flash-lite` already returns 404
 * for projects that had not used it before.
 */
export const TERRY_MODEL = 'gemini-flash-latest';

/**
 * Null when Firebase is not configured.
 *
 * Uses the Gemini Developer API backend, the one available on the free Spark
 * plan; the Vertex AI backend requires billing. The API key never reaches the
 * client — Firebase proxies the call, and App Check attests it came from us.
 */
export function getTerryModel(systemInstruction: string): GenerativeModel | null {
  const app = getFirebaseApp();
  if (!app) return null;

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    model: TERRY_MODEL,
    systemInstruction,
    generationConfig: {
      // Flash models spend "thinking" tokens out of this same budget, so a
      // tight cap truncated the visible answer — sometimes mid-way through
      // the model's own planning, which then leaked into the bubble.
      // Headroom for both, since this model rejects a zero thinking budget.
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });
}
