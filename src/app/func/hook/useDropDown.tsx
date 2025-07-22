import { useState, useEffect } from "react";
import { useAuth } from "@/AuthContext";

export function useDropDown({ messageToUser }: { messageToUser: number | null }) {
  const { loginStatus } = useAuth();

  const [writerDrop, setWriterDrop] = useState<boolean>(false);
  const [dropPosition, setDropPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!loginStatus) return;

    const clickOutSide = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdownEl = document.querySelector(".dropDownMenu");

      if ((dropdownEl && dropdownEl.contains(target)) || messageToUser !== null) {
        return;
      }
      setWriterDrop(false);
    };

    const scrolling = () => {
      if (messageToUser !== null) return;
      setWriterDrop(false);
    };

    document.addEventListener("mousedown", clickOutSide);
    window.addEventListener("scroll", scrolling);

    return () => {
      document.removeEventListener("mousedown", clickOutSide);
      window.removeEventListener("scroll", scrolling);
    };
  }, [messageToUser]);

  const userClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!loginStatus) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    setDropPosition({
      top: rect.top,
      left: rect.left,
    });

    setWriterDrop(true);
  };

  return {
    writerDrop,
    setWriterDrop,
    dropPosition,
    setDropPosition,
    userClick,
  };
}
