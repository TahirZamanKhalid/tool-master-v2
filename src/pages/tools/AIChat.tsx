import { ToolLayout } from '@/components/ToolLayout';
import { AIChat as AIChatComponent } from '@/components/AIChat';

const AIChat = () => {
  return (
    <ToolLayout
      title="AI Chat Assistant"
      description="Chat with an advanced AI powered by Google Gemini 2.5 Pro. Get answers, brainstorm ideas, or have a conversation about anything."
      category="ai"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Your Personal AI Assistant</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by Google's most advanced Gemini 2.5 Pro model. Get intelligent responses,
            creative solutions, and helpful assistance for any task.
          </p>
        </div>
        
        <AIChatComponent />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">💡 Creative Writing</h3>
            <p className="text-sm text-muted-foreground">
              Generate stories, poems, or creative content
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">🔍 Research & Learning</h3>
            <p className="text-sm text-muted-foreground">
              Get explanations and learn new concepts
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">💻 Code Help</h3>
            <p className="text-sm text-muted-foreground">
              Debug code, learn programming, get solutions
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default AIChat;
