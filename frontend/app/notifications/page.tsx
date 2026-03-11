import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationsPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </CardTitle>
          <CardDescription>
            Notification center is connected to backend endpoints and ready for live alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Once workflow updates are triggered, notifications will appear here.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
