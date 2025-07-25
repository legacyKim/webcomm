import Header from "../components/header";
import Footer from "../components/footer";
import MenuServer from "../components/menu.server";
import Right_ad from "../components/right_ad";

interface LayoutWrapperProps {
  children: React.ReactNode;
  siteSettings?: {
    logo_url?: string;
    site_name?: string;
    site_description?: string;
    favicon_url?: string;
  };
}

export default function LayoutWrapper({ children, siteSettings }: LayoutWrapperProps) {
  return (
    <>
      <Header siteSettings={siteSettings} />
      <div className='page main'>
        <MenuServer />
        {children}
        <Right_ad />
      </div>
      <Footer />
    </>
  );
}
