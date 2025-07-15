import Image from "next/image";

export default function Logo() {
  return <Image src='/logo.png' width={110} height={44} alt='Tokti Logo' priority />;
}
