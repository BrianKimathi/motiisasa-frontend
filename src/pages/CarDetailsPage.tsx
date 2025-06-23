import CarDetails from "../components/CarDetails";
import Layout from "../components/Layout";

function cardetails() {
  return (
    <Layout>
      <main className="pt-32 flex flex-col items-center">
        <CarDetails />
      </main>
    </Layout>
  );
}

export default cardetails;
