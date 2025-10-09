"use client";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, Users, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Metadata } from "next";

// Note: This is a client component, so metadata export won't work here
// In a real app, you'd create a separate metadata file or use a server component

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  teamSize: z.string().min(1, "Please select your team size"),
  currentTools: z.string().min(1, "Please tell us about your current tools"),
  integrations: z.array(z.string()).min(1, "Please select at least one integration"),
  useCase: z.string().min(10, "Please provide more details about your use case"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  newsletter: z.boolean().optional()
});

type FormData = z.infer<typeof formSchema>;

const integrations = [
  { id: "lattice", label: "Project Lattice" },
  { id: "sentry", label: "Sentry" },
  { id: "vscode", label: "VSCode" },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "jenkins", label: "Jenkins" },
  { id: "circleci", label: "CircleCI" },
  { id: "other", label: "Other" }
];

const benefits = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Early Access",
    description: "Be among the first to experience autonomous debugging"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Direct Support",
    description: "Get priority support from our engineering team"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Beta Features",
    description: "Access to cutting-edge features before public release"
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Special Pricing",
    description: "Lock in exclusive beta pricing for life"
  }
];

export default function BetaSignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      integrations: [],
      agreeToTerms: false,
      newsletter: true
    }
  });

  const watchedIntegrations = watch("integrations");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Welcome to the BugSage beta! Check your email for next steps.");
      
      // In a real app, you would send this data to your backend
      console.log("Form submitted:", data);
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIntegrationChange = (integrationId: string, checked: boolean) => {
    const newIntegrations = checked
      ? [...watchedIntegrations, integrationId]
      : watchedIntegrations.filter(id => id !== integrationId);
    
    setValue("integrations", newIntegrations);
    trigger("integrations");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-background to-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Limited Beta Access
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Join the BugSage
                <span className="text-primary"> Beta Program</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Be among the first to experience autonomous debugging. Get early access to new features, 
                priority support, and help shape the future of error resolution.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center border border-border">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        {benefit.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Form */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    Apply for Beta Access
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below to join our exclusive beta program
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          {...register("name")}
                          placeholder="John Doe"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="john@company.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        {...register("company")}
                        placeholder="Acme Corp"
                        className={errors.company ? "border-red-500" : ""}
                      />
                      {errors.company && (
                        <p className="text-sm text-red-500">{errors.company.message}</p>
                      )}
                    </div>

                    {/* Team Size */}
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Select onValueChange={(value) => setValue("teamSize", value)}>
                        <SelectTrigger className={errors.teamSize ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select your team size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Just me</SelectItem>
                          <SelectItem value="2-5">2-5 developers</SelectItem>
                          <SelectItem value="6-20">6-20 developers</SelectItem>
                          <SelectItem value="21-50">21-50 developers</SelectItem>
                          <SelectItem value="51-100">51-100 developers</SelectItem>
                          <SelectItem value="100+">100+ developers</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.teamSize && (
                        <p className="text-sm text-red-500">{errors.teamSize.message}</p>
                      )}
                    </div>

                    {/* Current Tools */}
                    <div className="space-y-2">
                      <Label htmlFor="currentTools">Current Debugging Tools *</Label>
                      <Textarea
                        id="currentTools"
                        {...register("currentTools")}
                        placeholder="Tell us about your current debugging setup (e.g., Sentry, Datadog, custom solutions)..."
                        rows={3}
                        className={errors.currentTools ? "border-red-500" : ""}
                      />
                      {errors.currentTools && (
                        <p className="text-sm text-red-500">{errors.currentTools.message}</p>
                      )}
                    </div>

                    {/* Integrations */}
                    <div className="space-y-2">
                      <Label>Interested Integrations *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {integrations.map((integration) => (
                          <div key={integration.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={integration.id}
                              checked={watchedIntegrations.includes(integration.id)}
                              onCheckedChange={(checked) => 
                                handleIntegrationChange(integration.id, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={integration.id} 
                              className="text-sm font-normal cursor-pointer"
                            >
                              {integration.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.integrations && (
                        <p className="text-sm text-red-500">{errors.integrations.message}</p>
                      )}
                    </div>

                    {/* Use Case */}
                    <div className="space-y-2">
                      <Label htmlFor="useCase">Use Case *</Label>
                      <Textarea
                        id="useCase"
                        {...register("useCase")}
                        placeholder="Describe your specific use case and what you hope to achieve with BugSage..."
                        rows={4}
                        className={errors.useCase ? "border-red-500" : ""}
                      />
                      {errors.useCase && (
                        <p className="text-sm text-red-500">{errors.useCase.message}</p>
                      )}
                    </div>

                    {/* Terms and Newsletter */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          {...register("agreeToTerms")}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          *
                        </Label>
                      </div>
                      {errors.agreeToTerms && (
                        <p className="text-sm text-red-500">{errors.agreeToTerms.message}</p>
                      )}

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="newsletter"
                          {...register("newsletter")}
                        />
                        <Label htmlFor="newsletter" className="text-sm">
                          I'd like to receive updates about BugSage features and announcements
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full text-lg py-6" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Apply for Beta Access"}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* What's Next */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Happens Next?
              </h2>
              
              <div className="space-y-6 text-left max-w-2xl mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Application Review</h3>
                    <p className="text-muted-foreground">Our team reviews your application within 2-3 business days</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Beta Invitation</h3>
                    <p className="text-muted-foreground">Receive an email with your beta access credentials and setup guide</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary-foreground font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Onboarding & Support</h3>
                    <p className="text-muted-foreground">Get personalized onboarding and priority support from our team</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}