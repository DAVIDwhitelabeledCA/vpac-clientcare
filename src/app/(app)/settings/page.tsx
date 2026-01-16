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

export default function SettingsPage() {
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
              <Accordion type="single" collapsible className="w-full">
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
                      />
                    </div>
                    <Button>Connect Google Sheets</Button>
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
                      />
                    </div>
                    <Button>Save AppSheet Configuration</Button>
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
