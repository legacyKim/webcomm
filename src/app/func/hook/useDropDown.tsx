import { useState, useEffect } from "react";

export function useDropDown() {
  const [writerDrop, setWriterDrop] = useState<boolean>(false);
  const [dropPosition, setDropPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setWriterDrop(false);
    };

    const handleScroll = (e: Event) => {
      console.log("스크롤 감지됨");
      setWriterDrop(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleWriterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
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
    handleWriterClick,
  };
}
