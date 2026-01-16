'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { staffData } from '@/lib/mock-data';

type TeamMember = (typeof staffData)[0];

export default function TeamPage() {
  const [selectedMember, setSelectedMember] =
    React.useState<TeamMember | null>(null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
      </div>
      <p className="text-muted-foreground">
        Manage your team and check their availability.
      </p>
      <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {staffData.map((member) => {
          const avatar = PlaceHolderImages.find(
            (img) => img.id === member.avatarId
          );
          return (
            <Card key={member.name}>
              <CardHeader className="items-center">
                <Avatar className="w-20 h-20 mb-2">
                  <AvatarImage
                    src={avatar?.imageUrl}
                    alt={member.name}
                    data-ai-hint={avatar?.imageHint}
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{member.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setSelectedMember(member)}
                >
                  Check Availability
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <Dialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember?.name}'s Availability</DialogTitle>
            <DialogDescription>
              Their calendar can be accessed via their Google Calendar ID:{' '}
              <span className="font-semibold text-primary break-all">
                {selectedMember?.calendarId || 'Not Available'}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
