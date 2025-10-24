import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}
