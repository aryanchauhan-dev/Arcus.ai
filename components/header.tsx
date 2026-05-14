import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  FileTextIcon,
  LayoutDashboard,
  PenBox,
  StarsIcon,
  Mic,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { SignOutButton } from "./signout-button";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const Header = async () => {

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const payload = accessToken ? await verifyToken(accessToken) : null;
  const isLoggedIn = !!payload;

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
      <nav className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        <Link href="/" aria-label="skillExa — go to homepage">
          <Image
            src="/arcus_ai_logo.svg"
            alt=""
            width={160}
            height={58}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">

          {isLoggedIn && (
            <>
              <Link href="/dashboard">
                <Button variant="outline">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span className="hidden md:block">Industry Insights</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Growth Tools menu">
                    <StarsIcon className="h-4 w-4" />
                    <span className="hidden md:block ml-2">Growth Tools</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/resume" className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4" />
                      <span>Resume Analyzer</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/ai-cover-letter" className="flex items-center gap-2">
                      <PenBox className="h-4 w-4" />
                      <span>Cover Letter</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span>Interview Prep</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {isLoggedIn ? (
            <SignOutButton variant="outline" />
          ) : (
            <Link href="/sign-in">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}

        </div>
      </nav>
    </header>
  );
};

export default Header;