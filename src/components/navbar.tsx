import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/navbar";
import { FiLogOut, FiHelpCircle } from "react-icons/fi";
import { AiOutlineControl } from "react-icons/ai";
import { GrAnalytics } from "react-icons/gr";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar
      className="border-b border-default-200/50 dark:border-default-100"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">CHAT</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as="div" justify="end">
        <ThemeSwitch />
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              color="secondary"
              name="Joseph"
              size="sm"
              src="https://avatars.githubusercontent.com/u/57763044?v=4"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownSection
              showDivider
              aria-label="Analytics & Configurations"
            >
              <DropdownItem key="analytics">
                <div className="flex items-center gap-2 my-2">
                  <GrAnalytics size="18"/>
                  <span className="text-[15px]">Analytics</span>
                </div>
              </DropdownItem>
              <DropdownItem key="configurations">
                <div className="flex items-center gap-2 my-2">
                  <AiOutlineControl size="18"/>
                  <span className="text-[15px]">Configurations</span>
                </div>
              </DropdownItem>
            </DropdownSection>
            <DropdownItem key="help_and_feedback">
              <div className="flex items-center gap-2 my-2">
                <FiHelpCircle size="18"/>
                <span className="text-[15px]">Help & Feedback</span>
              </div>
            </DropdownItem>
            <DropdownItem key="logout" color="danger">
              <div className="flex items-center gap-2 my-2">
                <FiLogOut size="18"/>
                <span className="text-[15px]">Log Out</span>
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </HeroUINavbar>
  );
};
