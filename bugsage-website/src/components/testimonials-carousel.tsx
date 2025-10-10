"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const testimonials = [
  {
    quote: "BugSage has transformed our debugging workflow. What used to take hours of manual investigation now gets resolved automatically. It's like having a senior developer on call 24/7.",
    author: "Sarah Chen",
    role: "Engineering Lead",
    company: "TechCorp",
    avatar: "SC",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    quote: "The integration with Project Lattice is game-changing. Our entire development pipeline is now autonomous, from error detection to deployment. BugSage handles the most time-consuming part automatically.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "StartupXYZ",
    avatar: "MJ",
    gradient: "from-green-500 to-teal-600",
  },
  {
    quote: "We've reduced our debugging time by 90% since implementing BugSage. The AI suggestions are remarkably accurate, and the safety features give us confidence to auto-apply fixes.",
    author: "Dr. Elena Rodriguez",
    role: "VP Engineering",
    company: "FinanceFlow",
    avatar: "ER",
    gradient: "from-orange-500 to-red-600",
  },
  {
    quote: "As a solo developer, BugSage is my secret weapon. It catches issues I might miss and suggests fixes that actually work. I can't imagine working without it anymore.",
    author: "Alex Kim",
    role: "Full-Stack Developer",
    company: "Freelance",
    avatar: "AK",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    quote: "The ROI on BugSage is incredible. We've saved thousands of developer hours and improved our code quality significantly. It pays for itself many times over.",
    author: "Jordan Taylor",
    role: "DevOps Manager",
    company: "CloudScale",
    avatar: "JT",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    quote: "BugSage's ability to understand our codebase context is impressive. It suggests fixes that align with our coding patterns and architectural decisions.",
    author: "Riley Patel",
    role: "Senior Developer",
    company: "DataTech",
    avatar: "RP",
    gradient: "from-cyan-500 to-green-600",
  },
];

export default function TestimonialsCarousel() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Developers Are Saying
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of developers who've transformed their debugging workflow with BugSage
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-5xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.play}
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 mx-2">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Rating */}
                        <div className="flex space-x-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="text-muted-foreground mb-6 flex-grow">
                          "{testimonial.quote}"
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                          >
                            {testimonial.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {testimonial.author}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {testimonial.role}
                            </div>
                            <div className="text-xs text-primary">
                              {testimonial.company}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-sm text-muted-foreground">Active Developers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Bugs Fixed</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}