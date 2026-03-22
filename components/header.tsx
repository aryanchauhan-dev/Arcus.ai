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

const Header = async() => {
  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-background/60">
      <nav className="px-4 lg:px-8 sm:px-6 h-20 flex items-center justify-between">

        <Link href="/">
          <Image
            src="/arcus_ai_logo.svg"
            alt="skillExa Logo"
            width={160}
            height={58}
            className="h-20 w-auto object-contain -ml-18"
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
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

          
          <Button variant={"outline"}>Sign In</Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
