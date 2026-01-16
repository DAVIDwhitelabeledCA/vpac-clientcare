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

// --- Mock Data simulating a Google Sheet ---
const allClientsData = [
  {
    id: 1,
    name: 'Andrew',
    email: 'Andrew@email.com',
    phone: '16045551212',
    streetAddress: '2831 kingsway',
    city: 'Vancouver',
    province: 'BC',
    postal: 'V5R5H9',
    addictionMedicine: 'Yes',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'YES',
    phn: '87654-3210',
    planG: 'Yes',
    narcoticPrescriptions: '',
    insuranceType: 'PPO',
    insuranceMemberId: '27379436432',
    insuranceGroupNo: '12',
    clientId: 'clientId-293845',
    clinicDoctor: 'kai@whitelabeled.ca',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-28',
    nextMeeting: '2024-08-05T09:00:00',
  },
  {
    id: 2,
    name: 'David Penny',
    email: 'david@whitelabeled.ca',
    phone: '17789031350',
    streetAddress: '211-316 Cedar Street',
    city: 'New Westminster',
    province: 'BC',
    postal: 'V3L3P1',
    addictionMedicine: 'Yes',
    treatmentClient: 'Yes',
    treatmentProvider: 'TWC',
    virtual: 'Usually',
    phn: '92340-2222',
    planG: 'No',
    narcoticPrescriptions: 'Vyvanse',
    insuranceType: 'Sunlife',
    insuranceMemberId: '1223344',
    insuranceGroupNo: 'G33221',
    clientId: 'clientId-983308',
    clinicDoctor: 'kai@whitelabeled.ca',
    column1: '',
    avatarId: 'avatar3',
    lastContact: '2024-07-25',
    nextMeeting: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Sarah Lee',
    email: 'sarah.l@gmail.com',
    phone: '12505559876',
    streetAddress: '100 Main St',
    city: 'Victoria',
    province: 'BC',
    postal: 'V8W1A1',
    addictionMedicine: 'No',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'YES',
    phn: '73210-9876',
    planG: 'Yes',
    narcoticPrescriptions: '',
    insuranceType: 'Plan G',
    insuranceMemberId: 'Plan G',
    insuranceGroupNo: '',
    clientId: 'clientId-112345',
    clinicDoctor: 'doctor@email.com',
    column1: '',
    avatarId: 'avatar1',
    lastContact: '2024-07-22',
    nextMeeting: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Robert Smith',
    email: 'rsmith@corp.com',
    phone: '14035552345',
    streetAddress: '45 Railway Ave SW',
    city: 'Calgary',
    province: 'AB',
    postal: 'T2P0X9',
    addictionMedicine: 'Yes',
    treatmentClient: 'Yes',
    treatmentProvider: 'AHS',
    virtual: 'NO',
    phn: '12345-6789',
    planG: 'No',
    narcoticPrescriptions: 'Methadone',
    insuranceType: 'Manulife',
    insuranceMemberId: '55566677788',
    insuranceGroupNo: 'M456',
    clientId: 'clientId-678901',
    clinicDoctor: 'kai@email.com',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-20',
    nextMeeting: null,
  },
  {
    id: 5,
    name: 'Jessica Chan',
    email: 'jessica.c@yahoo.ca',
    phone: '16045558888',
    streetAddress: '123 Waterfront Dr',
    city: 'Richmond',
    province: 'BC',
    postal: 'V6X3L3',
    addictionMedicine: 'No',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'Usually',
    phn: '34567-8901',
    planG: 'Yes',
    narcoticPrescriptions: '',
    insuranceType: '',
    insuranceMemberId: '',
    insuranceGroupNo: '',
    clientId: 'clientId-334455',
    clinicDoctor: 'doctor@email.com',
    column1: '',
    avatarId: 'avatar4',
    lastContact: '2024-07-30',
    nextMeeting: null,
  },
  {
    id: 6,
    name: 'Michael Brown',
    email: 'mbrown@live.ca',
    phone: '15875551122',
    streetAddress: '800 North Rd',
    city: 'Edmonton',
    province: 'AB',
    postal: 'T5K2R7',
    addictionMedicine: 'Yes',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'YES',
    phn: '90123-4567',
    planG: 'No',
    narcoticPrescriptions: '',
    insuranceType: '',
    insuranceMemberId: '',
    insuranceGroupNo: '',
    clientId: 'clientId-778899',
    clinicDoctor: 'kai@email.com',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-28',
    nextMeeting: '2024-08-05T09:00:00',
  },
  {
    id: 7,
    name: 'Emily White',
    email: 'ewhite@work.com',
    phone: '13065554321',
    streetAddress: '14 B St. E',
    city: 'Saskatoon',
    province: 'SK',
    postal: 'S7K0P7',
    addictionMedicine: 'No',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'NO',
    phn: '56789-0123',
    planG: 'Yes',
    narcoticPrescriptions: '',
    insuranceType: '',
    insuranceMemberId: '',
    insuranceGroupNo: '',
    clientId: 'clientId-210987',
    clinicDoctor: 'doctor@email.com',
    column1: '',
    avatarId: 'avatar1',
    lastContact: '2024-07-25',
    nextMeeting: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Kevin Green',
    email: 'k.green@mail.com',
    phone: '12045557890',
    streetAddress: '25 Portage Ave',
    city: 'Winnipeg',
    province: 'MB',
    postal: 'R3C0B6',
    addictionMedicine: 'Yes',
    treatmentClient: 'Yes',
    treatmentProvider: 'WPT',
    virtual: 'YES',
    phn: '21098-7654',
    planG: 'No',
    narcoticPrescriptions: 'Fentanyl Patch',
    insuranceType: 'Sunlife',
    insuranceMemberId: '88776655443',
    insuranceGroupNo: 'G22110',
    clientId: 'clientId-543210',
    clinicDoctor: 'kai@email.com',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-22',
    nextMeeting: new Date().toISOString(),
  },
  {
    id: 9,
    name: 'Olivia Hall',
    email: 'ohall@outlook.com',
    phone: '19055551000',
    streetAddress: '78 Queen St',
    city: 'Toronto',
    province: 'ON',
    postal: 'M5V2R9',
    addictionMedicine: 'No',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'Usually',
    phn: '65432-1098',
    planG: 'Yes',
    narcoticPrescriptions: 'Ativan',
    insuranceType: 'PPO',
    insuranceMemberId: '33221100998',
    insuranceGroupNo: '12',
    clientId: 'clientId-901234',
    clinicDoctor: 'doctor@email.com',
    column1: '',
    avatarId: 'avatar4',
    lastContact: '2024-07-20',
    nextMeeting: null,
  },
  {
    id: 10,
    name: 'William King',
    email: 'billk@whitelabeled.ca',
    phone: '14165552020',
    streetAddress: '150 Financial Blvd',
    city: 'Mississauga',
    province: 'ON',
    postal: 'L5R3G5',
    addictionMedicine: 'Yes',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'NO',
    phn: '10987-6543',
    planG: 'No',
    narcoticPrescriptions: '',
    insuranceType: 'Blue Cross',
    insuranceMemberId: '77665544332',
    insuranceGroupNo: 'BC005',
    clientId: 'clientId-876543',
    clinicDoctor: 'kai@email.com',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-30',
    nextMeeting: null,
  },
  {
    id: 11,
    name: 'Maria Perez',
    email: 'mperez@hotmail.com',
    phone: '15145553030',
    streetAddress: '300 Rue Sherbrooke',
    city: 'Montreal',
    province: 'QC',
    postal: 'H2L1J6',
    addictionMedicine: 'No',
    treatmentClient: 'No',
    treatmentProvider: 'N/A',
    virtual: 'YES',
    phn: '43210-9876',
    planG: 'Yes',
    narcoticPrescriptions: 'Clonazepam',
    insuranceType: 'Manulife',
    insuranceMemberId: '22110099887',
    insuranceGroupNo: 'M789',
    clientId: 'clientId-456789',
    clinicDoctor: 'doctor@email.com',
    column1: '',
    avatarId: 'avatar1',
    lastContact: '2024-07-28',
    nextMeeting: '2024-08-05T09:00:00',
  },
  {
    id: 12,
    name: 'Ben Carter',
    email: 'bcarter@telus.net',
    phone: '17095554040',
    streetAddress: '5 Water Street',
    city: "St. John's",
    province: 'NL',
    postal: 'A1C6C5',
    addictionMedicine: 'Yes',
    treatmentClient: 'Yes',
    treatmentProvider: 'Solid Ground',
    virtual: 'Usually',
    phn: '89012-3456',
    planG: 'No',
    narcoticPrescriptions: 'Morphine',
    insuranceType: 'Green Shield',
    insuranceMemberId: '66554433221',
    insuranceGroupNo: 'GSC11',
    clientId: 'clientId-109876',
    clinicDoctor: 'kai@email.com',
    column1: '',
    avatarId: 'avatar2',
    lastContact: '2024-07-25',
    nextMeeting: new Date().toISOString(),
  },
  {
    id: 13,
    name: 'Kai Demo',
    email: 'kai@whitelabeled.ca',
    phone: '16044519854',
    streetAddress: '2831 Kingsway, Vancouver, BC V5R 5H9, Canada',
    city: 'Vancouver',
    province: 'British Columbia',
    postal: 'V5R5H9',
    addictionMedicine: 'FALSE',
    treatmentClient: '',
    treatmentProvider: '',
    virtual: 'Yes',
    phn: '74568-2345',
    planG: 'FALSE',
    narcoticPrescriptions: 'None',
    insuranceType: '',
    insuranceMemberId: '',
    insuranceGroupNo: '',
    clientId: 'clientId-demo',
    clinicDoctor: 'kai@whitelabeled.ca',
    column1: '',
    avatarId: 'avatar3',
    lastContact: '2024-07-22',
    nextMeeting: new Date().toISOString(),
  },
];


type Client = (typeof allClientsData)[0];

const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const upcomingClientsData = allClientsData
  .filter((c) => {
    if (!c.nextMeeting) return false;
    const meetingDate = new Date(c.nextMeeting);
    return meetingDate >= today && meetingDate < tomorrow;
  })
  .map((c) => ({
    ...c,
    time: new Date(c.nextMeeting!).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }));

const toTitleCase = (str: string) => {
  const result = str.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const initialFieldConfig = Object.keys(allClientsData[0]).map((key) => ({
  key: key as keyof Client,
  label: toTitleCase(key),
  visible: ![
    'id',
    'avatarId',
    'lastContact',
    'nextMeeting',
    'column1',
    'clientId',
    'province',
    'postal',
  ].includes(key),
}));

type FieldConfig = typeof initialFieldConfig;

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    upcomingClientsData.length > 0 ? upcomingClientsData[0] : null
  );
  const [editedClient, setEditedClient] = useState<Client | null>(
     upcomingClientsData.length > 0 ? { ...upcomingClientsData[0] } : null
  );
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
    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allClientsData.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
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
    // Simulate API call to update the data source
    setTimeout(() => {
      setSelectedClient(editedClient);
      // Here you would also update the `allClientsData` array or refetch
      setIsEditing(false);
      setIsSaving(false);
      toast({
        title: 'Client Updated',
        description: `${editedClient?.name}'s information has been saved.`,
      });
    }, 1000);
  };

  const toggleFieldVisibility = (key: keyof Client) => {
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
                  placeholder="Enter client name, email, project..."
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
                  {upcomingClientsData.length > 0 ? (
                    upcomingClientsData.map((client) => {
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
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No upcoming meetings today.
                      </TableCell>
                    </TableRow>
                  )}
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
                          value={editedClient?.[key] || ''}
                          onChange={(e) =>
                            handleFieldChange(
                              key,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground p-2 min-h-[36px]">
                          {String(selectedClient?.[key] || 'N/A')}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      {initialFieldConfig.map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <Label htmlFor={`vis-${key}`} className="font-normal">
                            {label}
                          </Label>
                          <Switch
                            id={`vis-${key}`}
                            checked={fieldConfig.find(f => f.key === key)?.visible}
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
