import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Conversation from './Conversation';
import LoadingElement from '../LoadingElement';

interface Message {
  text: string;
}

// This component holds the conversation and input form
function ChatBox() {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Upon recieving a new message, snap to the bottom of ref to display newest message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      console.log('check');
    }
  }, [conversation]);

  // Submits user input and gets OpenAI response
  async function onSubmit(event: { preventDefault: () => void }) {
    // Disables page reload, must be before isLoading
    event.preventDefault();

    // Disables multipress to negate bug
    if (isLoading) {
      return;
    }
    // Creates loading element while waiting for function to complete
    setIsLoading(true);

    // Submits user message to conversation component while waiting for response
    const newMessage: Message = { text: ` user: ${userInput}` };
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    setUserInput('');

    try {
      const inputText = updatedConversation
        .map((message) => message.text)
        .join('');
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      });
      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      //setConversation(data.result);
      const aiResponse: Message = { text: data.result };
      //conversation.push(aiResponse);
      const updatedConversationWithAI = [...updatedConversation, aiResponse];
      setConversation(updatedConversationWithAI);
      setIsLoading(false);
      console.log(conversation);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="chat-box" ref={containerRef}>
      {/* Holds the messages between user and ai */}
      <div>
        <Conversation
          conversation={
            Array.isArray(conversation) ? conversation : [conversation]
          }
        />
      </div>

      {isLoading && (
        <div className="ChatBox-loading-element">
          <LoadingElement />
        </div>
      )}
      {/* Manages the Input Box */}
      <div className="form-container">
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="chatbot"
            placeholder="Ask a question"
            autoComplete="off"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="input-box"
          />
          <input type="submit" value="Go" className="submit-button-chatbox" />
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
