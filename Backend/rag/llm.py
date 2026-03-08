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
You are a professional data analyst assistant.

Use ONLY the provided dataset context to answer.

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