import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, Menu } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { LogoIcon } from "./Icons";
import { ModeToggle } from "./mode-toggle";

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
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container flex h-16 w-screen items-center justify-between px-4">
          <NavigationMenuItem className="flex font-bold">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 flex items-center text-xl font-semibold tracking-tight text-slate-900"
            >
              <LogoIcon />
              IMUPilot
            </a>
          </NavigationMenuItem>

          <nav className="hidden items-center gap-1 md:flex">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-sm font-medium text-slate-600 transition hover:text-slate-900 ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <a
              rel="noreferrer noopener"
              href="#"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Log in
            </a>
            <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <ModeToggle />
          </div>

          <span className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu className="h-5 w-5" onClick={() => setIsOpen(true)}>
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
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}
                  <a
                    rel="noreferrer noopener"
                    href="#"
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Log in
                  </a>
                  <Button className="mt-2 rounded-full bg-slate-900 text-white hover:bg-slate-800">
                    Get Started
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </span>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
