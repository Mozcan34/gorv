import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, List, Clock, CheckCircle, BarChart3, X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: Home,
    current: true,
  },
  {
    name: "Tüm İşler",
    href: "#",
    icon: List,
    current: false,
  },
  {
    name: "Bekleyen İşler",
    href: "#",
    icon: Clock,
    current: false,
  },
  {
    name: "Tamamlanan İşler",
    href: "#",
    icon: CheckCircle,
    current: false,
  },
  {
    name: "Raporlar",
    href: "#",
    icon: BarChart3,
    current: false,
  },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden">
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menü</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-6 w-6 text-gray-400" />
          </Button>
        </div>
        <nav className="mt-5 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? "bg-blue-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                )}
                onClick={onClose}
              >
                <Icon
                  className={cn(
                    item.current
                      ? "text-primary"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-5 w-5"
                  )}
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
