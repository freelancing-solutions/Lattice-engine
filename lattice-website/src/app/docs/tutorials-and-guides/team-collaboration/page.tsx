"use client";

import React from "react";
import { motion } from "framer-motion";

import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Users,
  UserPlus,
  Shield,
  MessageSquare,
  GitBranch,
  Eye,
  Bell,
  Code,
  FileText,
  Folder,
  Lock,
  UserCheck,
  UserX,
  Crown,
  CheckCircle,
  AlertCircle,
  Share2,
  Slack,
  Github,
  Trello,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  X,
  Hash,
} from "lucide-react";

export default function TeamCollaborationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <header className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users className="w-4 h-4 mr-2" />
              Team Collaboration
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Team Collaboration Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn how to effectively collaborate with your team using Lattice
              Engine’s powerful collaboration features — from role management to
              real-time synchronization.
            </p>
          </header>

          {/* Quick Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: UserPlus, label: "Team Setup" },
                  { icon: Shield, label: "Permissions" },
                  { icon: GitBranch, label: "Workflows" },
                  { icon: Activity, label: "Real-time Sync" },
                ].map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="setup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="setup">Team Setup</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
            </TabsList>

            {/* Team Setup */}
            <TabsContent value="setup">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Setting Up Your Team
                  </CardTitle>
                  <CardDescription>
                    Configure your team structure and invite members to
                    collaborate effectively.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <Section
                    title="1. Create Your Team"
                    icon={Crown}
                    code={`// Initialize a new team
const team = await lattice.teams.create({
  name: "Frontend Development Team",
  description: "Responsible for UI/UX development",
  settings: {
    defaultPermissions: "contributor",
    requireApproval: true,
    enableRealTimeSync: true
  }
});

console.log("Team created:", team.id);`}
                  />

                  <Section
                    title="2. Invite Team Members"
                    icon={MessageSquare}
                    code={`// Invite members with specific roles
const invitations = await lattice.teams.invite(team.id, [
  {
    email: "alice@company.com",
    role: "admin",
    permissions: ["read", "write", "approve", "manage"]
  },
  {
    email: "bob@company.com", 
    role: "contributor",
    permissions: ["read", "write"]
  }
]);

console.log("Invitations sent:", invitations.length);`}
                  />

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Folder className="w-4 h-4 mr-2" />
                      3. Organize Team Structure
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Roles & Responsibilities
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <RoleList />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Team Channels
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            <ListItem icon={Hash} text="#general - Team announcements" />
                            <ListItem icon={Code} text="#development - Code discussions" />
                            <ListItem
                              icon={FileText}
                              text="#documentation - Spec updates"
                            />
                            <ListItem
                              icon={AlertCircle}
                              text="#alerts - System notifications"
                            />
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communication */}
            <TabsContent value="communication">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Team Communication
                  </CardTitle>
                  <CardDescription>
                    Set up effective communication channels and notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Section
                    title="Notification Configuration"
                    icon={Bell}
                    code={`// Configure team notifications
const notifications = await lattice.notifications.configure({
  channels: {
    slack: {
      webhook: "https://hooks.slack.com/...",
      channel: "#development",
      events: ["mutation_created", "approval_needed", "merge_completed"]
    },
    email: {
      recipients: ["team@company.com"],
      events: ["critical_errors", "deployment_status"]
    }
  }
});`}
                  />

                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      Tool Integrations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <IntegrationCard icon={Slack} name="Slack" desc="Real-time updates" />
                      <IntegrationCard icon={Github} name="GitHub" desc="Repo sync" />
                      <IntegrationCard icon={Trello} name="Trello" desc="Project management" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring */}
            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Team Monitoring & Analytics
                  </CardTitle>
                  <CardDescription>
                    Monitor team performance and collaboration metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MetricsGrid />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Best Practices */}
            <TabsContent value="best-practices">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Best Practices
                  </CardTitle>
                  <CardDescription>
                    Proven strategies for effective team collaboration with
                    Lattice Engine.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BestPractices />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

/* ------------------ Utility Components ------------------ */

const Section = ({ title, icon: Icon, code }: any) => (
  <div>
    <h3 className="text-lg font-semibold mb-3 flex items-center">
      <Icon className="w-4 h-4 mr-2" />
      {title}
    </h3>
    <div className="bg-gray-50 p-4 rounded-lg">
      <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  </div>
);

const ListItem = ({ icon: Icon, text }: any) => (
  <li className="flex items-center">
    <Icon className="w-4 h-4 mr-2 text-gray-600" />
    {text}
  </li>
);

const RoleList = () => (
  <ul className="space-y-2 text-sm">
    <ListItem icon={Crown} text={<><strong>Admin:</strong> Full management</>} />
    <ListItem icon={UserCheck} text={<><strong>Contributor:</strong> Edit & collaborate</>} />
    <ListItem icon={Eye} text={<><strong>Reviewer:</strong> Approve changes</>} />
    <ListItem icon={UserX} text={<><strong>Viewer:</strong> Read-only access</>} />
  </ul>
);

const IntegrationCard = ({ icon: Icon, name, desc }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center">
        <Icon className="w-4 h-4 mr-2" />
        {name}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 mb-2">{desc}</p>
      <Button size="sm" variant="outline">
        Configure
      </Button>
    </CardContent>
  </Card>
);

const MetricsGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { value: "24", label: "Active Mutations", color: "text-blue-600" },
      { value: "89%", label: "Approval Rate", color: "text-green-600" },
      { value: "2.3h", label: "Avg Review Time", color: "text-orange-600" },
      { value: "156", label: "Completed Tasks", color: "text-purple-600" },
    ].map(({ value, label, color }) => (
      <Card key={label}>
        <CardContent className="p-4">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const BestPractices = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold mb-3 flex items-center">
      <MessageSquare className="w-4 h-4 mr-2" />
      Communication Guidelines
    </h3>
    <ul className="space-y-2 text-sm">
      <li>
        <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
        Use descriptive commit messages.
      </li>
      <li>
        <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
        Share regular status updates.
      </li>
      <li>
        <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" />
        Provide constructive feedback in code reviews.
      </li>
    </ul>
  </div>
);
