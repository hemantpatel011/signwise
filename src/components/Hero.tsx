import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden india-pride">
      {/* Heritage pattern background */}
      <div className="absolute inset-0 heritage-pattern" />
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Made in India Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-card border border-border rounded-full text-sm font-medium text-foreground mb-8 shadow-heritage hover-heritage animate-gentle-bounce">
            <Shield className="w-4 h-4 mr-2 text-primary animate-float" />
            <span className="font-heading">🇮🇳 Made in India</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span>AI-Powered Legal Document Analysis</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-heading text-balance">
            Understand{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent animate-shimmer">
              Legal Documents
            </span>{" "}
            in Minutes, Not Hours
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed font-body text-balance">
            SignWise uses advanced AI technology to analyze contracts, NDAs, and agreements,
            highlighting risks and providing instant insights. Built with innovation and pride in India,
            empowering legal professionals worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group">
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
            <Button 
              variant="glass" 
              size="xl"
              onClick={() => window.open('https://github.com/hemantpatel011/signwise.git', '_blank')}
            >
              GitHub
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-6 bg-gradient-card rounded-xl shadow-heritage hover-heritage craft-smooth border border-border/50">
              <Brain className="w-6 h-6 text-primary animate-gentle-bounce" />
              <span className="text-foreground font-medium font-heading">AI Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 bg-gradient-card rounded-xl shadow-heritage hover-heritage craft-smooth border border-border/50">
              <FileCheck className="w-6 h-6 text-accent animate-gentle-bounce" style={{ animationDelay: "0.5s" }} />
              <span className="text-foreground font-medium font-heading">Risk Detection</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-6 bg-gradient-card rounded-xl shadow-heritage hover-heritage craft-smooth border border-border/50">
              <Shield className="w-6 h-6 text-navy animate-gentle-bounce" style={{ animationDelay: "1s" }} />
              <span className="text-foreground font-medium font-heading">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced floating elements with Indian theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-gentle-bounce" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gold/15 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/3 right-1/3 w-60 h-60 bg-navy/15 rounded-full blur-3xl animate-gentle-bounce" style={{ animationDelay: "2s" }} />
      </div>
    </section>
  );
}