import { Button } from "@/components/ui/button";
import { Menu, CheckSquare, User } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-600 hover:text-primary"
              onClick={onMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center ml-2 md:ml-0">
              <div className="bg-primary text-white rounded-lg p-2 mr-3">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">İş Yönetimi</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">Hoş geldiniz,</span>
              <span className="text-sm font-medium text-gray-900">Kullanıcı</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="bg-primary text-white rounded-full hover:bg-blue-700"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
