import Image from "next/image";

export default function Logo() {
  return <Image src='/logo.png' width={100} height={40} alt='Tokti Logo' priority />;
}
