import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "../auth/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  return (
    <nav className="bg-blue-300 sticky top-0 z-50 m-4 border-black border-r-2 border-l-2 border-b-8 border-t-2 rounded max-w-screen-lg mx-auto">
      <div className="flex flex-wrap items-center justify-between mx-auto p-5">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-black sm:text-3xl text-2xl font-black whitespace-nowrap">
            Medicolog
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {user && (
            <span className="font-bold text-black rounded md:hidden text-sm">
              {user.displayName}
            </span>
          )}
          <button
            data-collapse-toggle="navbar"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg md:hidden"
            aria-controls="navbar"
            aria-expanded="false"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div className="hidden w-full md:block md:w-auto" id="navbar">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
            <li>
              <Link
                href="/"
                className={`block py-2 px-3 rounded md:p-0 text-lg ${
                  pathname === "/"
                    ? "underline"
                    : "text-black text-lg hover:underline"
                }`}
              >
                Home
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  href="/appointments"
                  className={`block py-2 px-3 rounded md:p-0 text-lg ${
                    pathname === "/appointments"
                      ? "underline"
                      : "text-black hover:underline"
                  }`}
                >
                  Appointments
                </Link>
              </li>
            )}
            {user && (
              <li>
                <Link
                  href="/records"
                  className={`block py-2 px-3 rounded md:p-0 text-lg ${
                    pathname === "/records"
                      ? "underline"
                      : "text-black hover:underline"
                  }`}
                >
                  Records
                </Link>
              </li>
            )}
            {user && (
              <li>
                <Link
                  href="/allergies"
                  className={`block py-2 px-3 rounded md:p-0 text-lg ${
                    pathname === "/allergies"
                      ? "underline"
                      : "text-black hover:underline"
                  }`}
                >
                  Allergies
                </Link>
              </li>
            )}
            {user && (
              <li>
                <Link
                  href="/profile"
                  className={`block py-2 px-3 rounded md:p-0 text-lg font-bold ${
                    pathname === "/profile"
                      ? "underline"
                      : "text-black hover:underline"
                  }`}
                >
                  {user.displayName}
                </Link>
              </li>
            )}
            <li></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
