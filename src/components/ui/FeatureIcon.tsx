import {
  Camera,
  Upload,
  Send,
  User,
  Palette,
  Clock,
  Sparkles,
  IndianRupee,
  Share2,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  camera: Camera,
  upload: Upload,
  publish: Send,
  user: User,
  palette: Palette,
  clock: Clock,
  sparkles: Sparkles,
  rupee: IndianRupee,
  share: Share2,
};

interface IconProps {
  name: string;
  className?: string;
}

export function FeatureIcon({ name, className = "w-6 h-6" }: IconProps) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon className={className} />;
}
