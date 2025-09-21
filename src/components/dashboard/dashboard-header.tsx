"use client";

import { LogOut, Coins, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ViewState {
  type: "main" | "themes" | "exercises";
  selectedName: string;
}

interface UserProfile {
  id: string;
  credits: number;
}

interface Session {
  user?: {
    name?: string | null;
  } | null;
}

interface DashboardHeaderProps {
  viewState: ViewState;
  session: Session | null;
  userProfile: UserProfile | null;
  onSignOut: () => void;
}

export function DashboardHeader({
  viewState,
  session,
  userProfile,
  onSignOut,
}: DashboardHeaderProps) {
  const getTitle = () => {
    switch (viewState.type) {
      case "main":
        return "Ուսանողական վահանակ";
      case "themes":
        return `${viewState.selectedName} - Թեմաներ`;
      case "exercises":
        return `${viewState.selectedName} - Վարժություններ`;
      default:
        return "Ուսանողական վահանակ";
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "Ու"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{session?.user?.name}</span>
            </div>
            {/* Credits */}
            {userProfile && (
              <div className="flex items-center">
                <span className="flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
                  <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                  {userProfile.credits} կրեդիտ
                </span>
                {userProfile.credits < 20 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-6 w-6 p-0 hover:bg-yellow-100"
                      >
                        <Info className="h-3 w-3 text-yellow-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-60 p-3"
                      side="bottom"
                      align="center"
                    >
                      <p className="text-sm text-gray-700">
                        Կրեդիտները ավելացվում են ամեն 30 րոպեում, քանի դեռ չեք
                        հասել 20-ի:
                      </p>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="ml-auto sm:ml-0"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ելք</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
