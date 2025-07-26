import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Brain, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-card border border-border rounded-full text-sm font-medium text-foreground mb-8 shadow-card">
            <Shield className="w-4 h-4 mr-2 text-primary" />
            AI-Powered Legal Document Analysis
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Understand{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Legal Documents
            </span>{" "}
            in Minutes, Not Hours
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            SignWise uses advanced AI to analyze contracts, NDAs, and agreements,
            highlighting risks and providing instant insights so you can make
            informed decisions faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group">
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-card rounded-lg shadow-card">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-foreground font-medium">AI Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-card rounded-lg shadow-card">
              <FileCheck className="w-6 h-6 text-primary" />
              <span className="text-foreground font-medium">Risk Detection</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-card rounded-lg shadow-card">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-foreground font-medium">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </section>
  );
}