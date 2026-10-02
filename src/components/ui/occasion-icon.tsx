import {
  Apple, Cake, Flower, Flower2, Gem, GraduationCap, Heart, Medal, PartyPopper, Puzzle, Sparkles, Sprout, TreePine, Users,
  type LucideProps,
} from "lucide-react";
import type { OccasionIcon as IconKey } from "@/lib/occasions";

const ICONS: Record<IconKey, React.ComponentType<LucideProps>> = {
  heart: Heart,
  sparkles: Sparkles,
  puzzle: Puzzle,
  flower2: Flower2,
  medal: Medal,
  apple: Apple,
  users: Users,
  sprout: Sprout,
  flower: Flower,
  tree: TreePine,
  cake: Cake,
  gem: Gem,
  grad: GraduationCap,
  party: PartyPopper,
};

export function OccasionIcon({ icon, ...props }: { icon: IconKey } & LucideProps) {
  const Icon = ICONS[icon] ?? Heart;
  return <Icon {...props} />;
}
