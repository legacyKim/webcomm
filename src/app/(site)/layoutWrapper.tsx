import Header from "../components/header";
import Footer from "../components/footer";
import Menu from "../components/menu";
import Right_ad from "../components/right_ad";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Menu />

      <div className="page main">
        {children}
        <Right_ad />
      </div>
      <Footer />
    </>
  );
}
