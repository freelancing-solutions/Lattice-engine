"use client";

import { useState } from "react";
import { Metadata } from "next";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MessageSquare,
  Users,
  ExternalLink,
  HelpCircle,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";
import { motion } from "framer-motion";

// Metadata is typically defined in page.tsx files, but for client components
// we'll need to handle this differently or move it to a layout
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const faqs = [
  {
    question: "How quickly do you respond to inquiries?",
    answer: "We typically respond within 24 hours during business days. For urgent technical issues, please include 'Urgent' in your subject line."
  },
  {
    question: "Do you offer technical support for beta users?",
    answer: "Yes, beta users receive priority technical support through our dedicated Discord channel and email support."
  },
  {
    question: "Can I schedule a demo for my team?",
    answer: "Absolutely! Use the contact form to request a demo, and we'll reach out to schedule a personalized walkthrough for your team."
  },
  {
    question: "What's the best way to report bugs or issues?",
    answer: "For bug reports, please use our GitHub Issues page. For general issues, the contact form works great."
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const watchedSubject = watch("subject");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Contact form submission:", data);
      toast.success("Message sent successfully! We'll get back to you soon.");

      // Reset form
      setValue("name", "");
      setValue("email", "");
      setValue("company", "");
      setValue("subject", "");
      setValue("message", "");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about BugSage? Want to schedule a demo? Need technical support?
              We're here to help you accelerate your debugging workflow.
            </p>
          </motion.div>

          {/* Contact Form and Info */}
          <div className="grid lg:grid-cols-3 gap-12 mb-20">
            {/* Contact Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          {...register("name")}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Your company (optional)"
                        {...register("company")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select onValueChange={(value) => setValue("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press & Media</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px]"
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Sales */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sales</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Interested in BugSage for your team? Let's discuss your needs.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/pricing">View Pricing</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Support</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Need help with BugSage? Check our docs first.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href="/docs">Documentation</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/support">Support Center</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Contact */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">General Inquiries</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        For all other questions, reach out to us directly.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">hello@bugsage.site</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}