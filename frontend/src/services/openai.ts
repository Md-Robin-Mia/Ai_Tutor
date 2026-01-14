import OpenAI from 'openai'

// Type declaration for Vite environment variables
declare const importMeta: {
  env: {
    VITE_OPENAI_API_KEY: string
    VITE_API_URL: string
    VITE_APP_TITLE: string
    [key: string]: string
  }
}

const openai = new OpenAI({
  apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are an AI Tutor, a helpful and knowledgeable educational assistant. Your goal is to help students learn effectively by:

1. Providing clear, accurate explanations
2. Being patient and encouraging
3. Breaking down complex topics into understandable parts
4. Asking questions to check understanding
5. Adapting to different learning styles
6. Being enthusiastic about learning

Focus on being educational, supportive, and thorough. If you don't know something, admit it and suggest how the student could find the answer.`
    }

    const allMessages = [systemPrompt, ...messages]

    if (onStream) {
      // Streaming response
      const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: allMessages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      })

      let fullResponse = ''
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          onStream(content)
        }
      }
      
      return fullResponse
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: allMessages,
        max_tokens: 1000,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your OpenAI API configuration.')
      } else if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      } else if (error.message.includes('500')) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('Failed to generate AI response. Please try again.')
  }
}

export const validateApiKey = (): boolean => {
  const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY
  return apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.length > 0
}
