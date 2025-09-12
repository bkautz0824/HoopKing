import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient-demo";
import { useToast } from "@/hooks/use-toast";

export default function FloatingAIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>>([]);
  const recognition = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not capture speech. Please try typing instead.",
          variant: "destructive",
        });
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const processMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      return await apiRequest("POST", "/api/ai/process-workout-message", { 
        message: userMessage 
      });
    },
    onSuccess: (response: any) => {
      const aiResponse = response.response || "I've processed your workout information.";
      setConversation(prev => [
        ...prev,
        { type: 'user', content: message, timestamp: new Date() },
        { type: 'ai', content: aiResponse, timestamp: new Date() }
      ]);
      setMessage("");
      
      if (response.workoutCreated) {
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["/api/workout-inbox"] });
        toast({
          title: "Workout Logged",
          description: "Your workout has been added to your training log.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startListening = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleSubmit = () => {
    if (message.trim()) {
      processMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-80 max-h-96 glass border-primary/20 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">AI Workout Assistant</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
                data-testid="button-close-ai-helper"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </Button>
            </div>
            
            {/* Conversation History */}
            {conversation.length > 0 && (
              <div className="max-h-32 overflow-y-auto mb-3 space-y-2">
                {conversation.slice(-4).map((msg, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      msg.type === 'user' 
                        ? 'bg-primary/10 text-primary ml-4' 
                        : 'bg-accent/10 text-accent mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-2">
              <Textarea
                placeholder="Tell me about your workout... (e.g., 'I just did 30 minutes of basketball practice')"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] text-sm resize-none"
                data-testid="input-workout-message"
              />
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!message.trim() || processMessageMutation.isPending}
                  className="flex-1 gradient-orange"
                  data-testid="button-send-message"
                >
                  {processMessageMutation.isPending ? (
                    <>
                      <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
                
                {recognition.current && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={startListening}
                    disabled={isListening || processMessageMutation.isPending}
                    className="px-3"
                    data-testid="button-voice-input"
                  >
                    {isListening ? (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                      </svg>
                    )}
                  </Button>
                )}
              </div>
              
              {isListening && (
                <div className="flex items-center space-x-2 text-xs text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-1 mt-3">
              {[
                "I just finished basketball practice",
                "Did a 30min cardio session", 
                "Completed strength training"
              ].map((quick, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/40"
                  onClick={() => setMessage(quick)}
                  data-testid={`button-quick-${index}`}
                >
                  {quick}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-2xl gradient-court animate-bounce-subtle"
        data-testid="button-ai-helper-toggle"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        )}
      </Button>
    </div>
  );
}