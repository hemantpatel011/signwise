import { Upload, Brain, FileText, Download } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload Document",
      description: "Drag and drop your legal documents or paste text directly. We support PDF, DOCX, images, and more."
    },
    {
      step: "02", 
      icon: Brain,
      title: "AI Analysis",
      description: "Our advanced AI analyzes your document, identifying key clauses, risks, and important terms in seconds."
    },
    {
      step: "03",
      icon: FileText,
      title: "Review Insights",
      description: "Get a comprehensive summary with highlighted risks, important clauses, and actionable insights."
    },
    {
      step: "04",
      icon: Download,
      title: "Export & Share",
      description: "Download detailed reports, save notes, or share findings with your team for informed decision-making."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              SignWise
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our streamlined process makes legal document analysis simple and efficient.
            Get insights in minutes with just a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent z-0" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-primary text-white text-sm font-bold rounded-full mb-4">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-card border border-border rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-elegant transition-smooth">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium hover:shadow-glow transition-smooth cursor-pointer">
            Try SignWise Free Today
          </div>
        </div>
      </div>
    </section>
  );
}