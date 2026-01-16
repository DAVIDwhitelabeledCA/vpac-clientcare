'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
} from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [googleSheetId, setGoogleSheetId] = useState('');
  const [appSheetUrl, setAppSheetUrl] = useState('');

  const [isSavingGoogleSheets, setIsSavingGoogleSheets] = useState(false);
  const [isSavingAppSheet, setIsSavingAppSheet] = useState(false);

  const integrationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'integrations');
  }, [firestore, user]);

  const { data: integrations } = useCollection<{
    service: string;
    spreadsheetId?: string;
    appUrl?: string;
  }>(integrationsQuery);

  useEffect(() => {
    if (integrations) {
      const googleSheetsIntegration = integrations.find(
        (int) => int.service === 'google-sheets'
      );
      if (googleSheetsIntegration?.spreadsheetId) {
        setGoogleSheetId(googleSheetsIntegration.spreadsheetId);
      }
      const appSheetIntegration = integrations.find(
        (int) => int.service === 'appsheet'
      );
      if (appSheetIntegration?.appUrl) {
        setAppSheetUrl(appSheetIntegration.appUrl);
      }
    }
  }, [integrations]);

  const handleSaveGoogleSheets = async () => {
    if (!user || !firestore) return;
    setIsSavingGoogleSheets(true);
    const integrationRef = doc(
      firestore,
      'users',
      user.uid,
      'integrations',
      'google-sheets'
    );
    const data = {
      id: 'google-sheets',
      userId: user.uid,
      service: 'google-sheets',
      spreadsheetId: googleSheetId,
    };
    setDocumentNonBlocking(integrationRef, data, { merge: true });
    toast({
      title: 'Settings Saved',
      description: 'Your Google Sheets integration has been updated.',
    });
    setTimeout(() => setIsSavingGoogleSheets(false), 1500);
  };

  const handleSaveAppSheet = async () => {
    if (!user || !firestore) return;
    setIsSavingAppSheet(true);
    const integrationRef = doc(
      firestore,
      'users',
      user.uid,
      'integrations',
      'appsheet'
    );
    const data = {
      id: 'appsheet',
      userId: user.uid,
      service: 'appsheet',
      appUrl: appSheetUrl,
    };
    setDocumentNonBlocking(integrationRef, data, { merge: true });
    toast({
      title: 'Settings Saved',
      description: 'Your AppSheet configuration has been updated.',
    });
    setTimeout(() => setIsSavingAppSheet(false), 1500);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branded Shortlinks</CardTitle>
              <CardDescription>
                Set up your custom domain for branded meeting links.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="shortlink-domain">Custom Domain</Label>
              <Input
                id="shortlink-domain"
                placeholder="e.g., meet.mycompany.com"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API & Service Integrations</CardTitle>
              <CardDescription>
                Connect Clarity Call to your favorite services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" defaultValue='google-sheets'>
                <AccordionItem value="google-meet">
                  <AccordionTrigger>Google Calendar & Meet</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Connect your Google account to sync calendars and create
                      Meet links.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="google-client-id">
                        OAuth Client ID
                      </Label>
                      <Input
                        id="google-client-id"
                        placeholder="Enter your Google OAuth Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="google-client-secret">
                        OAuth Client Secret
                      </Label>
                      <Input
                        id="google-client-secret"
                        type="password"
                        placeholder="Enter your Google OAuth Client Secret"
                      />
                    </div>
                    <Button>Connect Google Account</Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="google-sheets">
                  <AccordionTrigger>Google Sheets</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Connect Google Sheets to look up client information from a
                      spreadsheet.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="sheets-spreadsheet-id">
                        Spreadsheet ID
                      </Label>
                      <Input
                        id="sheets-spreadsheet-id"
                        placeholder="Enter your Google Sheet ID"
                        value={googleSheetId}
                        onChange={(e) => setGoogleSheetId(e.target.value)}
                        disabled={isSavingGoogleSheets}
                      />
                    </div>
                    <Button
                      onClick={handleSaveGoogleSheets}
                      disabled={isSavingGoogleSheets}
                    >
                      {isSavingGoogleSheets && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSavingGoogleSheets
                        ? 'Saving...'
                        : 'Connect Google Sheets'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="appsheet">
                  <AccordionTrigger>AppSheet</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Integrate with an AppSheet application to view client
                      records.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="appsheet-app-url">App URL</Label>
                      <Input
                        id="appsheet-app-url"
                        placeholder="Enter your AppSheet App URL"
                        value={appSheetUrl}
                        onChange={(e) => setAppSheetUrl(e.target.value)}
                        disabled={isSavingAppSheet}
                      />
                    </div>
                    <Button
                      onClick={handleSaveAppSheet}
                      disabled={isSavingAppSheet}
                    >
                      {isSavingAppSheet && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSavingAppSheet
                        ? 'Saving...'
                        : 'Save AppSheet Configuration'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="microsoft">
                  <AccordionTrigger>Microsoft</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Connect your Microsoft account to sync calendars and
                      create Teams links.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="ms-client-id">
                        Application (client) ID
                      </Label>
                      <Input
                        id="ms-client-id"
                        placeholder="Enter your Microsoft App Client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ms-client-secret">Client Secret</Label>
                      <Input
                        id="ms-client-secret"
                        type="password"
                        placeholder="Enter your Microsoft Client Secret"
                      />
                    </div>
                    <Button>Connect Microsoft Account</Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="quo">
                  <AccordionTrigger>Quo (OpenPhone)</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      Connect Quo to send SMS confirmations and reminders.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="quo-api-key">API Key</Label>
                      <Input
                        id="quo-api-key"
                        type="password"
                        placeholder="Enter your Quo API Key"
                      />
                    </div>
                    <Button>Save Quo Configuration</Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
