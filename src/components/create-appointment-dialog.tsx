'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Phone, Loader2, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  name: string;
}

interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
}

interface CreateAppointmentDialogProps {
  onSuccess?: () => void;
}

export function CreateAppointmentDialog({ onSuccess }: CreateAppointmentDialogProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingClients, setSearchingClients] = useState(false);
  const [searchingStaff, setSearchingStaff] = useState(false);
  
  // Form state
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  // Fetch staff list when dialog opens
  useEffect(() => {
    if (open && staff.length === 0) {
      fetchStaff();
    }
  }, [open]);

  const fetchStaff = async () => {
    if (!user) return;
    
    setSearchingStaff(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/staff/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data.staff || []);
      
      // Auto-select current user if they're staff
      if (user.uid && data.staff) {
        const currentUserStaff = data.staff.find((s: Staff) => s.id === user.uid);
        if (currentUserStaff) {
          setSelectedStaffId(currentUserStaff.id);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setSearchingStaff(false);
    }
  };

  const searchClients = async (query: string) => {
    if (!user || query.length < 2) {
      setClients([]);
      return;
    }

    setSearchingClients(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search clients');
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error: any) {
      console.error('Error searching clients:', error);
      setClients([]);
    } finally {
      setSearchingClients(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (clientSearch) {
        searchClients(clientSearch);
      } else {
        setClients([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [clientSearch]);

  const handleSubmit = async () => {
    if (!selectedClient || !selectedStaffId || !date || !time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Parse time (expecting HH:MM format)
      const [hours, minutes] = time.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      // Default to 30-minute appointment
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 30);

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: selectedClient.id,
          clientEmail: selectedClient.email,
          staffId: selectedStaffId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: reason || 'Appointment scheduled by staff',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create appointment');
      }

      const data = await response.json();
      
      toast({
        title: 'Appointment Created',
        description: `Appointment scheduled for ${selectedClient.name} on ${format(date, 'PPP')} at ${time}`,
      });

      // Reset form
      setSelectedClient(null);
      setClientSearch('');
      setSelectedStaffId('');
      setDate(new Date());
      setTime('');
      setReason('');
      setOpen(false);

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Create Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription>
            Schedule an appointment for a client. This is useful when taking calls from patients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Search */}
          <div className="space-y-2">
            <Label htmlFor="client-search">Client *</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="client-search"
                placeholder="Search by name, email, or phone..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  if (!e.target.value) {
                    setSelectedClient(null);
                  }
                }}
                className="pl-8"
              />
            </div>
            {searchingClients && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}
            {clients.length > 0 && !selectedClient && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      setSelectedClient(client);
                      setClientSearch(client.name);
                      setClients([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-3"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.email} {client.phone && `• ${client.phone}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedClient && (
              <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedClient.email} {selectedClient.phone && `• ${selectedClient.phone}`}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedClient(null);
                    setClientSearch('');
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff">Staff Member *</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={searchingStaff}>
              <SelectTrigger>
                <SelectValue placeholder={searchingStaff ? 'Loading...' : 'Select staff member'} />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.role === 'office_assistant' ? 'Office Assistant' : 'Staff'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Notes</Label>
            <Textarea
              id="reason"
              placeholder="Optional: Add reason for appointment or notes..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedClient || !selectedStaffId || !date || !time}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Appointment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
