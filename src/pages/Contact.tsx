import Contact from "../components/Contact";
import Layout from "../components/Layout";

function contact() {
  return (
    <Layout>
      <main className="pt-32 flex flex-col items-center">
        <Contact />
      </main>
    </Layout>
  );
}

export default contact;
