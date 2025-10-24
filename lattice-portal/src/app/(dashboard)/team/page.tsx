'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserPlusIcon, 
  SettingsIcon, 
  MoreVerticalIcon,
  SearchIcon,
  FilterIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  ShieldIcon,
  CrownIcon
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'reviewer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  lastActive: string;
  contributions: {
    mutations: number;
    reviews: number;
    projects: number;
  };
  permissions: string[];
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalContributions: number;
}

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800',
  developer: 'bg-blue-100 text-blue-800',
  reviewer: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const ROLE_ICONS = {
  admin: CrownIcon,
  developer: UsersIcon,
  reviewer: ShieldIcon,
  viewer: UsersIcon
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    totalContributions: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, currentOrganization } = useAuthStore();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate mock team data
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@lattice.com',
          avatar: '/avatars/alice.jpg',
          role: 'admin',
          status: 'active',
          joinedAt: '2024-01-15',
          lastActive: '2024-01-20',
          contributions: { mutations: 45, reviews: 23, projects: 8 },
          permissions: ['manage_users', 'approve_mutations', 'create_projects']
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@lattice.com',
          role: 'developer',
          status: 'active',
          joinedAt: '2024-01-10',
          lastActive: '2024-01-19',
          contributions: { mutations: 32, reviews: 18, projects: 5 },
          permissions: ['create_mutations', 'review_code']
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@lattice.com',
          role: 'reviewer',
          status: 'active',
          joinedAt: '2024-01-08',
          lastActive: '2024-01-20',
          contributions: { mutations: 12, reviews: 67, projects: 3 },
          permissions: ['review_mutations', 'approve_changes']
        },
        {
          id: '4',
          name: 'David Wilson',
          email: 'david@lattice.com',
          role: 'developer',
          status: 'inactive',
          joinedAt: '2024-01-05',
          lastActive: '2024-01-15',
          contributions: { mutations: 28, reviews: 14, projects: 4 },
          permissions: ['create_mutations', 'review_code']
        },
        {
          id: '5',
          name: 'Eva Martinez',
          email: 'eva@lattice.com',
          role: 'viewer',
          status: 'pending',
          joinedAt: '2024-01-18',
          lastActive: '2024-01-18',
          contributions: { mutations: 0, reviews: 0, projects: 0 },
          permissions: ['view_projects']
        }
      ];

      setTeamMembers(mockMembers);
      
      const stats: TeamStats = {
        totalMembers: mockMembers.length,
        activeMembers: mockMembers.filter(m => m.status === 'active').length,
        pendingInvites: mockMembers.filter(m => m.status === 'pending').length,
        totalContributions: mockMembers.reduce((sum, m) => 
          sum + m.contributions.mutations + m.contributions.reviews, 0
        )
      };
      
      setTeamStats(stats);
    } catch (err) {
      setError('Failed to load team data');
      console.error('Team data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteUser = () => {
    // TODO: Implement user invitation
    console.log('Invite user');
  };

  const handleUpdateRole = (memberId: string, newRole: string) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole as any } : member
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTeamData} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions for {currentOrganization?.name || 'your organization'}
          </p>
        </div>
        <Button onClick={handleInviteUser}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <MailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.pendingInvites}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalContributions}</div>
            <p className="text-xs text-muted-foreground">
              Mutations + Reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const RoleIcon = ROLE_ICONS[member.role];
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        <Badge className={ROLE_COLORS[member.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {member.role}
                        </Badge>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {member.contributions.mutations + member.contributions.reviews} contributions
                      </div>
                      <div className="text-muted-foreground">
                        {member.contributions.mutations} mutations, {member.contributions.reviews} reviews
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No team members found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}