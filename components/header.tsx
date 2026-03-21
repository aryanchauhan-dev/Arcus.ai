import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  FileTextIcon,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu";
import { checkUser } from "@/lib/CheckUser";

const Header = async() => {
  await checkUser();
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
      <nav className="px-4 lg:px-8 sm:px-6 h-16 flex items-center justify-between">

        <Link href="/">
          <Image
            src="/logo1.png"
            alt="skillExa Logo"
            width={280}
            height={80}
            className="h-28 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button variant={"outline"} className="cursor-pointer">
                <LayoutDashboard className="h-4 w-3 mr-2" />
                <span className="hidden md:block">Industry Insights</span>
              </Button>
            </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} className="cursor-pointer">
                <StarsIcon className="h-4 w-3" />
                <span className="hidden md:block">Growth Tools</span>
                <ChevronDown className="h-4 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link
                  href={"/resume-builder"}
                  className="flex items-center gap-2"
                >
                  <FileTextIcon className="h-4 w-3" />
                  <span>Build Resume</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={"/ai-cover-letter"}
                  className="flex items-center gap-2"
                >
                  <PenBox className="h-4 w-3" />
                  <span>Cover Letter</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/interview"} className="flex items-center gap-2">
                  <FileTextIcon className="h-4 w-3" />
                  <span>Interview Prep</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </Show>

          <Show when="signed-out">
        <SignInButton>
          <Button variant={"outline"}>Sign In</Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton appearance={{
          elements:{
            avatarBox: "h-10 w-10",
            userButtonPopoverCard: "shadow-lg border border-gray-200",
            userButtonPopoverActionButton: "hover:bg-gray-100",
            userPreviewMainIdentifier: "font-semibold"
          },
        }}/>
      </Show>
        </div>
      </nav>
    </header>
  );
};

export default Header;
