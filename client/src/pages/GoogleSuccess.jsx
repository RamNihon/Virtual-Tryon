import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const sellerStr = searchParams.get("seller");

    if (token && sellerStr) {
      try {
        const seller = JSON.parse(decodeURIComponent(sellerStr));
        login(seller, token);
        navigate("/dashboard");
      } catch {
        navigate("/login?error=parse_error");
      }
    } else {
      navigate("/login?error=no_data");
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className="min-h-screen flex items-center
                    justify-center bg-gray-50"
    >
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🔐</div>
        <p className="text-purple-600 font-medium animate-pulse">
         Logging in with Google, Please Wait.....
        </p>
      </div>
    </div>
  );
}
