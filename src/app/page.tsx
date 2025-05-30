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

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: ${props => props.$connected ? '#10b981' : '#ef4444'};
`;

const StatusDot = styled.div<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? '#10b981' : '#ef4444'};
`;

const TestButton = styled.button`
  background: #6b7280;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  margin-left: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #4b5563;
  }
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

  // FastAPI backend URL - use deployed API in production, localhost in development
  const fastApiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api-hxgjmodoi-mmieszeks-projects.vercel.app' // Deployed API URL
    : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000');

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check FastAPI backend connection on component mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Checking FastAPI health at:', `${fastApiUrl}/health`);
        const response = await fetch(`${fastApiUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Health check response:', data);
          setConnected(true);
        } else {
          console.error('Health check failed with status:', response.status);
          setConnected(false);
        }
      } catch (error) {
        console.error('Health check error:', error);
        setConnected(false);
      }
    };
    
    // Check immediately
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fastApiUrl]);

  // Manual connection test function
  const testConnection = async () => {
    try {
      console.log('Manual health check at:', `${fastApiUrl}/health`);
      const response = await fetch(`${fastApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Manual health check response:', data);
        setConnected(true);
        alert('✅ Connection successful!');
      } else {
        console.error('Manual health check failed with status:', response.status);
        setConnected(false);
        alert(`❌ Connection failed: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Manual health check error:', error);
      setConnected(false);
      alert(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSend = async () => {
    if (!apiKey.trim() || !userMessage.trim() || loading) return;

    const newUserMessage: Message = { text: userMessage, isUser: true };
    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${fastApiUrl}/chat`, {
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
        text: 'Sorry, there was an error processing your request. Please check your API key and ensure the FastAPI server is running.', 
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
          <Subtitle>AI Engineer Challenge - Deployed on Vercel</Subtitle>
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
          <ConnectionStatus $connected={connected}>
            <StatusDot $connected={connected} />
            FastAPI Backend: {connected ? 'Connected' : 'Disconnected'} ({fastApiUrl})
            <TestButton onClick={testConnection}>Test</TestButton>
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