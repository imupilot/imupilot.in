import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";
import { LogoIcon } from "./Icons";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  { href: "#mock-tests", label: "Mock Tests" },
  { href: "#learn", label: "Learn" },
  { href: "#analytics", label: "Analytics" },
  { href: "#dns", label: "DNS Sponsorship" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-semibold tracking-tight text-slate-900"
        >
          <LogoIcon />
          IMUPilot
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {routeList.map((route: RouteProps) => (
            <a
              href={route.href}
              key={route.label}
              className={`text-sm font-medium text-slate-600 transition hover:text-slate-900 ${buttonVariants({
                variant: "ghost",
              })}`}
            >
              {route.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            to="/coming-soon"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Log in
          </Link>
          <Button asChild className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
            <Link to="/coming-soon">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="px-2">
              <Menu className="h-5 w-5">
                <span className="sr-only">Menu Icon</span>
              </Menu>
            </SheetTrigger>

            <SheetContent side={"left"}>
              <SheetHeader>
                <SheetTitle className="text-xl font-semibold">IMUPilot</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {routeList.map(({ href, label }: RouteProps) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    {label}
                  </a>
                ))}
                <Link
                  to="/coming-soon"
                  onClick={() => setIsOpen(false)}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  Log in
                </Link>
                <Button asChild className="mt-2 rounded-full bg-slate-900 text-white hover:bg-slate-800">
                  <Link to="/coming-soon" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
