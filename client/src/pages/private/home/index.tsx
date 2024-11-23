import { useEffect, useState } from "react";
import usersGlobalStore, { UsersStoreType } from "../../../store/users-store";
import { message } from "antd";
import Spinner from "../../../components/spinner";

function Homepage() {
  const { currentUser } = usersGlobalStore() as UsersStoreType;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 text-xl font-bold">
        Welcome, {currentUser?.name}!!!
      </p>
    </div>
  );
}

export default Homepage;
