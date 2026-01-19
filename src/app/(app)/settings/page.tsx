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
  deleteDocumentNonBlocking,
} from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader, CheckCircle2, XCircle } from 'lucide-react';
import { initiateGoogleOAuth, initiateMicrosoftOAuth } from '@/lib/calendar-api';

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [googleSheetId, setGoogleSheetId] = useState('');
  const [appSheetUrl, setAppSheetUrl] = useState('');

  const [isSavingGoogleSheets, setIsSavingGoogleSheets] = useState(false);
  const [isSavingAppSheet, setIsSavingAppSheet] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = useState(false);

  const integrationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'integrations');
  }, [firestore, user]);

  const { data: integrations } = useCollection<{
    service: string;
    spreadsheetId?: string;
    appUrl?: string;
    googleEmail?: string;
    microsoftEmail?: string;
    connectedAt?: string;
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

  const googleIntegration = integrations?.find((int) => int.service === 'google-meet');
  const microsoftIntegration = integrations?.find((int) => int.service === 'microsoft-teams');

  const handleConnectGoogle = async () => {
    if (!user) return;
    setIsConnectingGoogle(true);
    try {
      const authUrl = await initiateGoogleOAuth();
      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate Google OAuth',
        variant: 'destructive',
      });
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!user || !firestore) return;
    const integrationRef = doc(firestore, 'users', user.uid, 'integrations', 'google-meet');
    deleteDocumentNonBlocking(integrationRef);
    toast({
      title: 'Disconnected',
      description: 'Google Calendar integration has been disconnected.',
    });
  };

  const handleConnectMicrosoft = async () => {
    if (!user) return;
    setIsConnectingMicrosoft(true);
    try {
      const authUrl = await initiateMicrosoftOAuth();
      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate Microsoft OAuth',
        variant: 'destructive',
      });
      setIsConnectingMicrosoft(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    if (!user || !firestore) return;
    const integrationRef = doc(firestore, 'users', user.uid, 'integrations', 'microsoft-teams');
    deleteDocumentNonBlocking(integrationRef);
    toast({
      title: 'Disconnected',
      description: 'Microsoft Calendar integration has been disconnected.',
    });
  };

  // Check for OAuth callback success/error in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'google_connected') {
      toast({
        title: 'Success',
        description: 'Google Calendar has been connected successfully.',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    } else if (success === 'microsoft_connected') {
      toast({
        title: 'Success',
        description: 'Microsoft Calendar has been connected successfully.',
      });
      window.history.replaceState({}, '', '/settings');
    } else if (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect: ${error}`,
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/settings');
    }
  }, [toast]);

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
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>Google Calendar & Meet</span>
                      {googleIntegration ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {googleIntegration ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="font-medium text-green-900 dark:text-green-100">
                              Connected
                            </p>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Connected as: {googleIntegration.googleEmail || 'Unknown'}
                          </p>
                          {googleIntegration.connectedAt && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Connected on:{' '}
                              {new Date(googleIntegration.connectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDisconnectGoogle}
                        >
                          Disconnect Google Account
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Connect your Google account to sync calendars and create
                          Meet links. Your calendar conflicts will be shown in the
                          availability calendar.
                        </p>
                        <Button
                          onClick={handleConnectGoogle}
                          disabled={isConnectingGoogle}
                        >
                          {isConnectingGoogle && (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isConnectingGoogle
                            ? 'Connecting...'
                            : 'Connect Google Account'}
                        </Button>
                      </>
                    )}
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
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>Microsoft Calendar & Teams</span>
                      {microsoftIntegration ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {microsoftIntegration ? (
                      <>
                        <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <p className="font-medium text-green-900 dark:text-green-100">
                              Connected
                            </p>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Connected as: {microsoftIntegration.microsoftEmail || 'Unknown'}
                          </p>
                          {microsoftIntegration.connectedAt && (
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Connected on:{' '}
                              {new Date(microsoftIntegration.connectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDisconnectMicrosoft}
                        >
                          Disconnect Microsoft Account
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Connect your Microsoft account to sync calendars and
                          create Teams links. Your calendar conflicts will be shown in the
                          availability calendar.
                        </p>
                        <Button
                          onClick={handleConnectMicrosoft}
                          disabled={isConnectingMicrosoft}
                        >
                          {isConnectingMicrosoft && (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isConnectingMicrosoft
                            ? 'Connecting...'
                            : 'Connect Microsoft Account'}
                        </Button>
                      </>
                    )}
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
