import Layout from "../components/Layout";
import Profile from "../components/Profile";

function user() {
  return (
    <Layout>
      <main className="pt-24 items-center">
        <Profile />
      </main>
    </Layout>
  );
}

export default user;
