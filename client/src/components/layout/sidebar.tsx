import { cn } from "@/lib/utils";
import { Home, List, Clock, CheckCircle, BarChart3, User } from "lucide-react";

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

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white shadow-md pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-4 space-y-2">
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
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="bg-gray-300 rounded-full h-9 w-9 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Kullanıcı
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    Proje Yöneticisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
