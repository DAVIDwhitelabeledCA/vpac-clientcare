'use client';

import { useState } from 'react';
import { Loader, Pencil, Save, X, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { allClientsData } from '@/lib/mock-data';

type Client = (typeof allClientsData)[0];

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

export default function ClientProfile({ client }: { client: Client }) {
  const [editedClient, setEditedClient] = useState<Client | null>({
    ...client,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldConfig, setFieldConfig] =
    useState<FieldConfig>(initialFieldConfig);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (key: keyof Client, value: string) => {
    if (editedClient) {
      setEditedClient({ ...editedClient, [key]: value });
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call to update the data source
    setTimeout(() => {
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-3">
            <User /> Detailed Information
          </CardTitle>
          <CardDescription>
            All available data for {client.name}.
          </CardDescription>
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
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground p-2 min-h-[36px]">
                  {String(client?.[key] || 'N/A')}
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
            <p className="font-medium text-sm">Toggle field visibility</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {initialFieldConfig.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`vis-${key}`} className="font-normal">
                    {label}
                  </Label>
                  <Switch
                    id={`vis-${key}`}
                    checked={fieldConfig.find((f) => f.key === key)?.visible}
                    onCheckedChange={() => toggleFieldVisibility(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
