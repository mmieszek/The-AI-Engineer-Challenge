'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ChatContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  text-align: center;
  border-radius: 20px 20px 0 0;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 8px 0 0 0;
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#f3f4f6'};
  color: ${props => props.isUser ? 'white' : '#374151'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const InputSection = styled.div`
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  border-radius: 0 0 20px 20px;
`;

const ApiKeyInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const DeveloperInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  resize: none;
  min-height: 60px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const UserInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  resize: none;
  min-height: 60px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #667eea;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.49);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingDots = styled.div`
  display: inline-block;
  
  &::after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${props => props.connected ? '#10b981' : '#ef4444'};
`;

const StatusDot = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.connected ? '#10b981' : '#ef4444'};
`;

interface Message {
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [developerMessage, setDeveloperMessage] = useState('You are a helpful AI assistant.');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // FastAPI backend URL - only use the FastAPI server
  const fastApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check FastAPI backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${fastApiUrl}/api/health`);
        setConnected(response.ok);
      } catch (error) {
        setConnected(false);
      }
    };
    checkConnection();
  }, [fastApiUrl]);

  const handleSend = async () => {
    if (!apiKey.trim() || !userMessage.trim() || loading) return;

    const newUserMessage: Message = { text: userMessage, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${fastApiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: developerMessage,
          user_message: userMessage,
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      // Add empty assistant message to start streaming
      setMessages(prev => [...prev, { text: '', isUser: false }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantResponse += chunk;
        
        // Update the last message (assistant response)
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            lastMessage.text = assistantResponse;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request. Please check your API key and ensure the FastAPI server is running on port 8000.', 
        isUser: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container>
      <ChatContainer>
        <Header>
          <Title>GPT-4.1-nano Chat</Title>
          <Subtitle>AI Engineer Challenge - FastAPI Backend Only</Subtitle>
        </Header>
        
        <ChatArea ref={chatAreaRef}>
          {messages.map((message, index) => (
            <MessageBubble key={index} isUser={message.isUser}>
              {message.text}
            </MessageBubble>
          ))}
          {loading && (
            <MessageBubble isUser={false}>
              <LoadingDots />
            </MessageBubble>
          )}
        </ChatArea>

        <InputSection>
          <ConnectionStatus connected={connected}>
            <StatusDot connected={connected} />
            FastAPI Backend: {connected ? 'Connected' : 'Disconnected'} ({fastApiUrl})
          </ConnectionStatus>
          
          <ApiKeyInput
            type="password"
            placeholder="Enter your OpenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          
          <InputContainer>
            <DeveloperInput
              placeholder="System/Developer message (optional)"
              value={developerMessage}
              onChange={(e) => setDeveloperMessage(e.target.value)}
            />
            <UserInput
              placeholder="Type your message here..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </InputContainer>

          <SendButton 
            onClick={handleSend} 
            disabled={!apiKey.trim() || !userMessage.trim() || loading || !connected}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </SendButton>
        </InputSection>
      </ChatContainer>
    </Container>
  );
} 