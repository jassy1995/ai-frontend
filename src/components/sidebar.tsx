import { NavLink } from "react-router-dom";
import {
  TbChevronLeft,
  TbChevronRight,
  TbCrown,
  TbSettings2,
  TbMessageChatbotFilled,
} from "react-icons/tb";
import { FaGoogleScholar } from "react-icons/fa6";
import { RiAiGenerate2 } from "react-icons/ri";
import { useState } from "react";
import { HiOutlineTemplate, HiOutlineViewGrid } from "react-icons/hi";
import { FC } from "react";
import { Button } from "@heroui/button";

import { cn } from "@/helper/util/global";

export interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  mini?: boolean;
}

const NavItem: FC<NavItemProps> = ({ icon, title, href, mini = false }) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex items-center px-5 py-2 rounded-3xl text-base",
          isActive
            ? `bg-black/5 dark:bg-white/10 font-semibold`
            : "hover:bg-black/5 opacity-80",
          { "w-12 h-12 p-0 justify-center": mini },
        )
      }
      to={href}
    >
      <div className={cn({ "mr-4": !mini })}>{icon}</div>
      {!mini && <span>{title}</span>}
    </NavLink>
  );
};

export default function Sidebar() {
  const [mini, setMini] = useState(false);

  return (
    <div
      className={cn("w-[300px] relative group transition-width", {
        "w-[90px]": mini,
      })}
    >
      <button
        aria-label={mini ? "Hide" : "Show"}
        className="absolute top-1/2 left-[calc(100%)] -translate-y-1/2 z-10 bg-[#eff6fd] dark:bg-gray-950 border border-default-200/50 dark:border-default-50 h-[56px] rounded-r-full transition-all duration-200"
        onClick={() => setMini(!mini)}
      >
        <div className="">
          {mini ? <TbChevronRight size="16" /> : <TbChevronLeft size="16" />}
        </div>
      </button>
      <div
        className={cn("w-[300px] h-full overflow-hidden", { "w-[90px]": mini })}
      >
        <div className={cn("w-[300px] h-full overflow-hidden")}>
          <div
            className={cn(
              "py-6 px-8 flex flex-col align-stretch w-[300px] relative h-full",
              { "items-start": mini },
            )}
          >
            {mini ? (
              <Button
                isIconOnly
                className="mb-8 w-12 h-12"
                color="primary"
                radius="full"
              >
                <RiAiGenerate2 size="20" />
              </Button>
            ) : (
              <div className="px-3 mb-8 flex items-center space-x-3">
                <Button
                  isIconOnly
                  className="w-10 h-10"
                  color="primary"
                  radius="full"
                >
                  <RiAiGenerate2 size="20" />
                </Button>
                <h1 className="font-medium text-xl">Guido 101</h1>
              </div>
            )}
            <div
              className={cn("flex flex-col space-y-2 mt-6", { "-ml-1": mini })}
            >
              {[
                {
                  name: "Chatbot",
                  href: "/",
                  icon: <TbMessageChatbotFilled size="20" />,
                },
                {
                  name: "Educational Mentor",
                  href: "/educational-mentor",
                  icon: <FaGoogleScholar size="20" />,
                },
                {
                  name: "Prompt Generator",
                  href: "/prompt-generator",
                  icon: <HiOutlineTemplate size="20" />,
                },
                {
                  name: "Prompt Refiner",
                  href: "/prompt-refiner",
                  icon: <HiOutlineViewGrid size="20" />,
                },
              ].map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  mini={mini}
                  title={item.name}
                />
              ))}
            </div>
            <div
              className={cn("flex flex-col space-y-2 mt-auto", {
                "-ml-1": mini,
              })}
            >
              {[
                {
                  name: "Upgrade",
                  href: `/plans`,
                  icon: <TbCrown className="text-orange-500" size="20" />,
                },
                {
                  name: "Settings",
                  href: `/settings`,
                  icon: <TbSettings2 size="20" />,
                },
              ].map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  mini={mini}
                  title={item.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
