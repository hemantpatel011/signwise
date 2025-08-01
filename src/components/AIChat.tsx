import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Document } from "@/hooks/useDocuments";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChat({ document, open, onOpenChange }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document && open) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm here to help you understand your document "${document.filename}". I've analyzed it and can answer questions about its content, risks, and recommendations. What would you like to know?`
        }
      ]);
    }
  }, [document, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !document || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response based on document analysis
    setTimeout(() => {
      let response = "";
      
      if (input.toLowerCase().includes('risk')) {
        response = `Based on my analysis of ${document.filename}, the document has a ${document.risk_level || 'unknown'} risk level${document.risk_score ? ` with a risk score of ${document.risk_score}/100` : ''}. `;
        
        if (document.analysis_results?.riskAreas?.length > 0) {
          response += `The main risk areas include: ${document.analysis_results.riskAreas.map((area: any) => area.category).join(', ')}. `;
        }
        
        response += "Would you like me to explain any specific risk area in more detail?";
      } else if (input.toLowerCase().includes('summary') || input.toLowerCase().includes('overview')) {
        response = document.analysis_results?.summary || "I've analyzed this document thoroughly. The analysis includes risk assessment, key findings, and recommendations for improvement.";
      } else if (input.toLowerCase().includes('recommendation')) {
        if (document.analysis_results?.recommendations?.length > 0) {
          response = `Here are the key recommendations for ${document.filename}: ${document.analysis_results.recommendations.slice(0, 3).join('. ')}`;
        } else {
          response = "Based on my analysis, I can provide specific recommendations once the document analysis is complete.";
        }
      } else {
        response = `I understand you're asking about "${input}". Based on my analysis of ${document.filename}, this relates to the document's ${document.risk_level || 'assessed'} risk profile. Would you like me to elaborate on any specific aspect of the analysis?`;
      }

      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // Random delay for realism
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[90vh] mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">AI Assistant - {document.filename}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[60vh] sm:h-[70vh]">
          <ScrollArea className="flex-1 p-2 sm:p-4 border rounded-lg mb-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-2 sm:ml-4'
                        : 'bg-muted mr-2 sm:mr-4'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-2 sm:p-3 rounded-lg mr-2 sm:mr-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask questions about this document..."
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              className="text-sm h-9"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="sm" className="h-9 px-3">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}