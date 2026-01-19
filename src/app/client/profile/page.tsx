'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Loader, Pencil, Save, X, User, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

type Client = {
  name: string;
  email: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  postal?: string;
  phn?: string;
  addictionMedicine?: string;
  treatmentClient?: string;
  treatmentProvider?: string;
  treatmentContact?: string;
  treatmentPhone?: string;
  treatmentEmail?: string;
  virtual?: string;
  planG?: string;
  narcoticPrescriptions?: string;
  insuranceType?: string;
  insuranceMemberId?: string;
  insuranceGroupNo?: string;
  clinicDoctor?: string;
  lastContact?: string;
  nextMeeting?: string | null;
};

// Fields that clients can edit
const editableFields: (keyof Client)[] = [
  'name',
  'email',
  'phone',
  'streetAddress',
  'city',
  'province',
  'postal',
  'virtual', // Client preference for appointment type
  'insuranceType',
  'insuranceMemberId',
  'insuranceGroupNo',
] as const;

// Fields that clients can view but not edit (read-only) - Medical Information
const readOnlyFields: (keyof Client)[] = [
  'phn',
  'clinicDoctor',
  'lastContact',
  'nextMeeting',
];

// Private treatment information - clients should NOT see this
const privateTreatmentFields: (keyof Client)[] = [
  'treatmentClient',
  'treatmentProvider',
  'treatmentContact',
  'treatmentPhone',
  'narcoticPrescriptions',
];

// Fields that should be hidden from clients (internal/admin only)
const hiddenFields: (keyof Client)[] = [
  'id',
  'clientId',
  'avatarId',
  'column1',
];

const toTitleCase = (str: string) => {
  const result = str.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export default function ClientProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userDoc, isLoading } = useDoc(userDocRef);

  const client = useMemo(() => {
    if (!userDoc || !user) return null;
    if (userDoc.role !== 'client') return null;
    
    return {
      name: `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || user.email || 'Client',
      email: userDoc.email || user.email || '',
      phone: userDoc.phone || '',
      streetAddress: userDoc.streetAddress || '',
      city: userDoc.city || '',
      province: userDoc.province || '',
      postal: userDoc.postal || '',
      phn: userDoc.phn || '',
      addictionMedicine: userDoc.addictionMedicine || '',
      treatmentClient: userDoc.treatmentClient || '',
      treatmentProvider: userDoc.treatmentProvider || '',
      treatmentContact: userDoc.treatmentContact || '',
      treatmentPhone: userDoc.treatmentPhone || '',
      virtual: userDoc.virtual || '',
      planG: userDoc.planG || '',
      narcoticPrescriptions: userDoc.narcoticPrescriptions || '',
      insuranceType: userDoc.insuranceType || '',
      insuranceMemberId: userDoc.insuranceMemberId || '',
      insuranceGroupNo: userDoc.insuranceGroupNo || '',
      clinicDoctor: userDoc.clinicDoctor || '',
      lastContact: userDoc.lastContact || '',
      nextMeeting: userDoc.nextMeeting || null,
    };
  }, [userDoc, user]);

  const [editedClient, setEditedClient] = useState<Client | null>(null);

  // Initialize edited client when client data is available
  useEffect(() => {
    if (client && !editedClient) {
      setEditedClient({ ...client });
    }
  }, [client, editedClient]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground">
          {userDoc?.role !== 'client' 
            ? 'You do not have client access. Please contact support if you believe this is an error.'
            : 'Your profile could not be found. Please contact support.'}
        </p>
      </div>
    );
  }

  const handleFieldChange = (key: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient({ ...editedClient, [key]: value });
    }
  };

  const handleSave = async () => {
    if (!firestore || !user || !editedClient || !userDocRef) return;
    
    setIsSaving(true);
    try {
      // Update only editable fields
      const updateData: any = {};
      if (editedClient.name !== client?.name) {
        const nameParts = editedClient.name.split(' ');
        updateData.firstName = nameParts[0] || '';
        updateData.lastName = nameParts.slice(1).join(' ') || '';
      }
      if (editedClient.email !== client?.email) updateData.email = editedClient.email;
      if (editedClient.phone !== client?.phone) updateData.phone = editedClient.phone;
      if (editedClient.streetAddress !== client?.streetAddress) updateData.streetAddress = editedClient.streetAddress;
      if (editedClient.city !== client?.city) updateData.city = editedClient.city;
      if (editedClient.province !== client?.province) updateData.province = editedClient.province;
      if (editedClient.postal !== client?.postal) updateData.postal = editedClient.postal;
      if (editedClient.virtual !== client?.virtual) updateData.virtual = editedClient.virtual;
      if (editedClient.insuranceType !== client?.insuranceType) updateData.insuranceType = editedClient.insuranceType;
      if (editedClient.insuranceMemberId !== client?.insuranceMemberId) updateData.insuranceMemberId = editedClient.insuranceMemberId;
      if (editedClient.insuranceGroupNo !== client?.insuranceGroupNo) updateData.insuranceGroupNo = editedClient.insuranceGroupNo;

      await updateDoc(userDocRef, updateData);
      
      setIsEditing(false);
      setIsSaving(false);
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditedClient({ ...client });
    setIsEditing(false);
  };

  const currentClient = editedClient || client;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">
            View and update your personal information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <User /> Personal Information
          </CardTitle>
          <CardDescription>
            Information you can view and update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editableFields.map((key) => {
              // Special handling for virtual field - show as preference selector
              if (key === 'virtual') {
                return (
                  <div className="space-y-1" key={key}>
                    <Label htmlFor={key}>Appointment Preference</Label>
                    {isEditing ? (
                      <Select
                        value={currentClient?.virtual || ''}
                        onValueChange={(value) => handleFieldChange(key, value)}
                      >
                        <SelectTrigger id={key}>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Teleconference">Teleconference</SelectItem>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                          <SelectItem value="In-Person">In-Person</SelectItem>
                          <SelectItem value="Flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground p-2 min-h-[36px] border rounded-md">
                        {client?.virtual || 'Not specified'}
                      </p>
                    )}
                  </div>
                );
              }
              
              return (
                <div className="space-y-1" key={key}>
                  <Label htmlFor={key}>{toTitleCase(key)}</Label>
                  {isEditing ? (
                    <Input
                      id={key}
                      value={String(currentClient?.[key] || '')}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 min-h-[36px] border rounded-md">
                      {String(client?.[key] || 'N/A')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lock /> Medical Information
          </CardTitle>
          <CardDescription>
            Medical information is read-only and managed by your healthcare provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readOnlyFields.map((key) => (
              <div className="space-y-1" key={key}>
                <Label htmlFor={`readonly-${key}`}>{toTitleCase(key)}</Label>
                <div className="relative">
                  <p className="text-sm text-muted-foreground p-2 min-h-[36px] border rounded-md bg-muted">
                    {String(client?.[key] || 'N/A')}
                  </p>
                  <Lock className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
