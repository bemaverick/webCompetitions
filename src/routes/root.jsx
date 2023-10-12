import { Outlet, NavLink, useLoaderData, Form, redirect, useNavigation, } from "react-router-dom";
import { getContacts, createContact } from "../contacts";
import AppBar from "../components/AppBar";
import { Button } from "@mui/material";
import { useAuth } from '../contexts/AuthContext';

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({request}) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts };
}

export default function Root() {
  const { contacts } = []
  const auth = useAuth();
  
 // const navigation = useNavigation();
  return (
    <>
      <div id="sidebar">
        <NavLink
          to={`tournament/`}
          className={({ isActive, isPending }) =>
            isActive
              ? "active"
              : isPending
              ? "pending"
              : ""
          }
        >
          <h2>
            Турнір
          </h2>
        </NavLink>
        <NavLink
          to={`tournamentSettings/`}
          className={({ isActive, isPending }) =>
            isActive
              ? "active"
              : isPending
              ? "pending"
              : ""
          }
        >
          <h2>
            Налаштування Турніру
          </h2>
        </NavLink>
        <NavLink
          to={`categories/`}
          className={({ isActive, isPending }) =>
            isActive
              ? "active"
              : isPending
              ? "pending"
              : ""
          }
        >
          <h2>
            Категорії
          </h2>
        </NavLink>
        <NavLink
          to={`competitors/`}
          className={({ isActive, isPending }) =>
            isActive
              ? "active"
              : isPending
              ? "pending"
              : ""
          }
        >
          <h2>
            Учасники
          </h2>
        </NavLink>
        <NavLink
          to={`results/`}
          className={({ isActive, isPending }) =>
            isActive
              ? "active"
              : isPending
              ? "pending"
              : ""
          }
        >
          <h2>
            Результати
          </h2>
        </NavLink>
        <Button onClick={() => auth.logout()}>Вихід</Button>
      </div>
      <div style={{  flex: 1,  }}>
        {/* <AppBar /> */}
        <Outlet />
      </div>

    </>
  );
}

export function Roo1t() {
  const { contacts } = []
  const navigation = useNavigation();
  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={true}
            />
            <div
              className="sr-only"
              aria-live="polite"
            ></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
             <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive
                        ? "active"
                        : isPending
                        ? "pending"
                        : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail"
        className={
          navigation.state === "loading" ? "loading" : ""
        }
      >
        <Outlet />
      </div>
    </>
  );
}