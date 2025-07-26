import { 
  Brain, 
  Shield, 
  FileSearch, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  Download,
  Users,
  Zap
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your documents with 99% accuracy, identifying key clauses and potential issues."
    },
    {
      icon: AlertTriangle,
      title: "Risk Detection",
      description: "Automatically identify dangerous clauses, unfavorable terms, and legal risks that could impact your business."
    },
    {
      icon: MessageSquare,
      title: "Ask AI Assistant",
      description: "Chat with our AI about your documents. Ask questions and get instant answers about complex legal terms."
    },
    {
      icon: FileSearch,
      title: "Smart Summaries",
      description: "Get comprehensive yet digestible summaries of lengthy legal documents in plain English."
    },
    {
      icon: Clock,
      title: "Instant Processing",
      description: "Upload and analyze documents in seconds, not hours. Save time and increase productivity."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your documents are encrypted and stored securely. We never share your data with third parties."
    },
    {
      icon: Download,
      title: "Export Reports",
      description: "Download detailed analysis reports in PDF format to share with your team or legal counsel."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share documents and insights with your team. Add comments and track changes efficiently."
    },
    {
      icon: Zap,
      title: "Multiple Formats",
      description: "Support for PDF, DOCX, images, and text files. Upload documents in any format you have."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Analyze Legal Documents
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SignWise combines cutting-edge AI technology with user-friendly design
            to make legal document analysis accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-xl shadow-card hover:shadow-elegant transition-smooth border border-border hover:border-primary/50"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}