import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const { currentUser } = useAuth();
  const { subscriptionTier, createCheckoutSession } = useSubscription();
  const { toast } = useToast();

  const handlePlanSelection = async (plan: string) => {
    if (!currentUser) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }

    try {
      await createCheckoutSession(plan);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out SignWise",
      features: [
        "5 document analyses per month",
        "Basic AI summaries",
        "PDF & text support",
        "Standard security",
        "Email support"
      ],
      cta: "Start Free",
      href: "/signup",
      variant: "outline" as const,
      planId: "free"
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Best for professionals and small teams",
      features: [
        "Unlimited document analyses",
        "Advanced AI insights",
        "All file formats supported",
        "Risk detection & flagging",
        "AI chat assistant",
        "Export reports",
        "Priority support",
        "Team collaboration"
      ],
      cta: "Start Pro Trial",
      href: "/signup?plan=pro",
      variant: "hero" as const,
      popular: true,
      planId: "pro"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Custom AI training",
        "API access",
        "SSO integration",
        "Advanced security",
        "Custom contracts",
        "Dedicated support",
        "Usage analytics"
      ],
      cta: "Contact Sales",
      href: "/contact",
      variant: "outline" as const,
      planId: "enterprise"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for you. All plans include our core AI analysis features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 bg-card rounded-xl shadow-card border transition-smooth hover:shadow-elegant ${
                plan.popular 
                  ? "border-primary scale-105" 
                  : subscriptionTier === plan.planId
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border hover:border-primary/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white text-sm font-medium rounded-full shadow-glow">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-card-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {subscriptionTier === plan.planId ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                  disabled
                >
                  Current Plan
                </Button>
              ) : plan.planId === "free" ? (
                <Link to={plan.href} className="block">
                  <Button 
                    variant={plan.variant} 
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={plan.variant} 
                  className="w-full"
                  size="lg"
                  onClick={() => handlePlanSelection(plan.planId)}
                >
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <span>✓ Bank-level security</span>
            <span>✓ GDPR compliant</span>
            <span>✓ 99.9% uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
}