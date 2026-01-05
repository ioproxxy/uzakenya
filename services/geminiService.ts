
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Store } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInventory = async (store: Store): Promise<Product[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic catalogue of 10-12 products for a store in Nairobi, Kenya named "${store.name}" which is a "${store.category}". For each product, provide a name, price (in Kenyan Shillings, format as "KSh X,XXX"), a short description reflecting local Kenyan tastes, 2-3 relevant tags, and assign it to one of 3 specific sub-categories relevant to this shop.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING, description: "Sub-category within the store" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["name", "price", "description", "tags", "category"]
          }
        }
      }
    });

    const products = JSON.parse(response.text);
    return products.map((p: any, index: number) => ({
      ...p,
      id: `prod-${store.id}-${index}`,
      storeId: store.id,
      image: `https://picsum.photos/seed/${store.name.replace(/\s+/g, '')}-${index}/400/400`
    }));
  } catch (error) {
    console.error("Error generating inventory:", error);
    return [
      {
        id: "fallback-1",
        storeId: store.id,
        name: "Premium Selection",
        price: "KSh 2,500",
        description: "A high-quality item sourced from local Nairobi artisans.",
        category: "Featured",
        image: `https://picsum.photos/seed/${store.id}-1/400/400`,
        tags: ["Best Seller", "Nairobi Made"]
      }
    ];
  }
};
