'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LogOut,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

const links = [
  {
    href: '/treatment-center',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/treatment-center/clients',
    label: 'My Clients',
    icon: Users,
  },
];

export default function TreatmentCenterSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/treatment-center-login');
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold">Treatment Center</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} className="w-full">
              <SidebarMenuButton
                isActive={pathname === link.href}
                className="w-full justify-start"
              >
                <link.icon className="size-4" />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <div className="flex items-center gap-3 rounded-md border p-2">
          <Avatar>
            <AvatarImage
              src={user?.photoURL ?? undefined}
              alt="User avatar"
            />
            <AvatarFallback>
              {user?.displayName?.charAt(0) ??
                user?.email?.charAt(0)?.toUpperCase() ??
                'T'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold truncate">
              {user?.displayName ?? 'Treatment Center'}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
