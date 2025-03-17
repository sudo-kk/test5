import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  linkText: string;
  linkUrl: string;
}

export default function StatsCard({ title, value, icon, linkText, linkUrl }: StatsCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkUrl}>
            <a className="font-medium text-primary hover:text-blue-600">
              {linkText}<span className="sr-only"> {title.toLowerCase()}</span>
            </a>
          </Link>
        </div>
      </div>
    </Card>
  );
}
