import os
import requests
from dotenv import load_dotenv

load_dotenv()

class OpenRouterLLM:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    def generate(self, context, question):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        prompt = f"""
You are a helpful AI assistant inside a data analysis application called DataLens.

RULES:
1. Always keep responses concise (2-5 sentences normally).
2. ONLY suggest actions that exist in the UI:
   - Cleaning: filling missing values, removing duplicates, dropping columns, handling outliers.
   - Validation: adding constraints, enforcing numeric ranges, detecting invalid rows, schema validation.
   - Visualization: bar chart, line chart, scatter plot, correlation analysis.
3. SUGGESTION FORMAT:
   Suggestion: [Suggested action]
   Reason: [Why it is useful]
4. TONE: Simple language, clear and direct, appropriate for students/beginners. Use dataset context.

Dataset Context:
{context}

User Question:
{question}
"""

        body = {
            "model": "openai/gpt-4o-mini",
            "max_tokens": 300,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        response = requests.post(self.url, headers=headers, json=body)

        data = response.json()

        if "choices" not in data:
            return f"LLM Error: {data}"

        return data["choices"][0]["message"]["content"]