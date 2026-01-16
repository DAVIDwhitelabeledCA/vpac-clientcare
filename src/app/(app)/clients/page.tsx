'use client';

import { useState } from 'react';
import {
  Search,
  User,
  Eye,
  EyeOff,
  Save,
  Pencil,
  X,
  Loader,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const upcomingClientsData = [
  {
    id: 1,
    name: 'Liam Johnson',
    email: 'liam@example.com',
    phone: '555-123-4567',
    company: 'Innovate Inc.',
    lastContact: '2024-07-28',
    avatarId: 'avatar2',
    time: '9:00 AM',
  },
  {
    id: 2,
    name: 'Olivia Smith',
    email: 'olivia@example.com',
    phone: '555-987-6543',
    company: 'Solutions Co.',
    lastContact: '2024-07-25',
    avatarId: 'avatar4',
    time: '10:00 AM',
  },
  {
    id: 3,
    name: 'Noah Williams',
    email: 'noah@example.com',
    phone: '555-555-5555',
    company: 'Creative LLC',
    lastContact: '2024-07-22',
    avatarId: 'avatar3',
    time: '11:00 AM',
  },
];

const allClientsData = [
  ...upcomingClientsData,
  {
    id: 4,
    name: 'Emma Brown',
    email: 'emma@example.com',
    phone: '555-111-2222',
    company: 'Tech Forward',
    lastContact: '2024-07-20',
    avatarId: 'avatar1',
    time: null,
  },
];

type Client = (typeof allClientsData)[0];

const initialFieldConfig = [
  { key: 'name', label: 'Full Name', visible: true },
  { key: 'email', label: 'Email Address', visible: true },
  { key: 'phone', label: 'Phone Number', visible: true },
  { key: 'company', label: 'Company', visible: true },
  { key: 'lastContact', label: 'Last Contact', visible: false },
];

type FieldConfig = typeof initialFieldConfig;

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editedClient, setEditedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>(
    initialFieldConfig
  );
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const results = allClientsData.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    if (results.length > 0) {
      handleSelectClient(results[0]);
    } else {
      handleSelectClient(null);
    }
  };

  const handleSelectClient = (client: Client | null) => {
    setSelectedClient(client);
    setEditedClient(client ? { ...client } : null);
    setIsEditing(false);
  };

  const handleFieldChange = (key: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient({ ...editedClient, [key]: value });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedClient(editedClient);
      setIsEditing(false);
      setIsSaving(false);
      toast({
        title: 'Client Updated',
        description: `${editedClient?.name}'s information has been saved.`,
      });
    }, 1000);
  };

  const toggleFieldVisibility = (key: string) => {
    setFieldConfig((prevConfig) =>
      prevConfig.map((field) =>
        field.key === key ? { ...field, visible: !field.visible } : field
      )
    );
  };

  const visibleFields = fieldConfig.filter((f) => f.visible);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Client Management</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Search Clients</CardTitle>
              <CardDescription>
                Find any client in your records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full max-w-lg items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter client name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Clients</CardTitle>
              <CardDescription>
                Clients with meetings scheduled for today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingClientsData.map((client) => {
                    const avatar = PlaceHolderImages.find(
                      (img) => img.id === client.avatarId
                    );
                    return (
                      <TableRow
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={avatar?.imageUrl} />
                              <AvatarFallback>
                                {client.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{client.time}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedClient ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <User /> Client Profile
                  </CardTitle>
                  <CardDescription>
                    Viewing details for {selectedClient.name}.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleFields.map(({ key, label }) => (
                    <div className="space-y-1" key={key}>
                      <Label htmlFor={key}>{label}</Label>
                      {isEditing ? (
                        <Input
                          id={key}
                          value={editedClient?.[key as keyof Client] || ''}
                          onChange={(e) =>
                            handleFieldChange(
                              key as keyof Client,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground p-2 min-h-[36px]">
                          {selectedClient?.[key as keyof Client] || 'N/A'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="field-visibility"
                    checked={showFieldSettings}
                    onCheckedChange={setShowFieldSettings}
                  />
                  <Label htmlFor="field-visibility">
                    Manage Visible Fields (Admin)
                  </Label>
                </div>
                {showFieldSettings && (
                  <div className="w-full space-y-2 rounded-md border p-4">
                    <p className="font-medium text-sm">
                      Toggle field visibility
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {fieldConfig.map(({ key, label, visible }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <Label htmlFor={`vis-${key}`} className="font-normal">
                            {label}
                          </Label>
                          <Switch
                            id={`vis-${key}`}
                            checked={visible}
                            onCheckedChange={() => toggleFieldVisibility(key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Client Selected</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search for a client or select one from the list to see their
                  details.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
