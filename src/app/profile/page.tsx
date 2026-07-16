import ProfileClient from './ProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account & Profile | Varam Organics',
  description: 'Manage your profile, saved billing addresses, security settings, and view past invoices.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
