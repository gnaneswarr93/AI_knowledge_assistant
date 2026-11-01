import { ChatMessage, Conversation, AnswerMode, DetailedFeedback } from '../types';

function getHeaders() {
  const token = localStorage.getItem('ea_knowledge_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/chat/conversations', { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  },

  async getConversation(id: string): Promise<Conversation | undefined> {
    const convs = await this.getConversations();
    return convs.find(c => c.id === id);
  },

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  async deleteConversation(id: string): Promise<void> {
    await fetch(`/api/chat/conversations/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },
  
  async uploadChatAttachment(
    conversationId: string,
    file: File,
  ): Promise<{
    id: string;
    name: string;
    type: string;
    status: string;
    chunksCount: number;
    conversationId: string;
  }> {
    const token = localStorage.getItem('ea_knowledge_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      `/api/chat/conversations/${conversationId}/attachments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    return await res.json();
  },

  async sendMessage(
    conversationId: string | null,
    content: string,
    onProgress?: (index: number, step: any) => void,
    attachment?: any,
    answerMode: AnswerMode = 'Concise'
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage; conversationId: string }> {
    let convId = conversationId;
    if (!convId) {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: getHeaders()
      });
      const newConv = await res.json();
      convId = newConv.id;
    }

    const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, answerMode })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error: ${res.status} ${errorText}`);
    }

    const assistantMessage = await res.json();
    
    // We mock the user message locally for quick return, but it's saved in DB
    const userMessage: ChatMessage = {
      id: `tmp-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    return { userMessage, assistantMessage, conversationId: convId as string };
  },

  async regenerateResponse(conversationId: string, messageId: string, answerMode: AnswerMode = 'Concise'): Promise<ChatMessage> {
    // Basic mock since we didn't fully implement regenerate in backend for brevity
    return {
      id: `msg-${Date.now()}-regen`,
      sender: 'assistant',
      content: 'Regenerated response not fully implemented in current backend demo.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRegenerated: true,
      answerMode
    };
  },

  async submitFeedback(conversationId: string, messageId: string, feedback: 'helpful' | 'unhelpful'): Promise<void> {
    await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ feedback })
    });
  },
  

  async submitDetailedFeedback(conversationId: string, messageId: string, detailedFeedback: DetailedFeedback): Promise<void> {
    await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}/detailed-feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ detailedFeedback })
    });
  },

  exportConversation(conversation: Conversation, format: 'markdown' | 'text' | 'json'): string {
    return JSON.stringify(conversation, null, 2);
  }
};


