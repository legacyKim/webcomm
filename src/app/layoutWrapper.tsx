import Header from "./components/header";
import Footer from "./components/footer";
import MenuServer from "./components/menu.server";
import Right_ad from "./components/right_ad";

export default function LayoutWrapper({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className='page main'>
        <MenuServer />
        {children}
        <Right_ad />
      </div>
      <Footer />
    </>
  );
}
