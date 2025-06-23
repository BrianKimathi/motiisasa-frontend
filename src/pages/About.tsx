import AboutHero from "../components/AboutHero";
import AboutTop from "../components/AboutTop";
import Customer from "../components/Customer";
import Layout from "../components/Layout";
import Steps from "../components/Steps";

function about() {
  return (
    <Layout>
      <main className="pt-32 flex flex-col items-center">
        <AboutTop />
        <AboutHero />
        <Steps />
        <Customer />
      </main>
    </Layout>
  );
}

export default about;
