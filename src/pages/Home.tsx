import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import Search from "../components/Search";
import Assurance from "../components/Assurance";
import Latest from "../components/Latest";
import Customer from "../components/Customer";

function Home() {
  return (
    <Layout>
      <main className="pt-32 flex flex-col items-center">
        <HeroSection />
        <Assurance />
        <Search />
        <Latest />
        <Customer />
      </main>
    </Layout>
  );
}

export default Home;
