import { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";

import { link as cssLink, styles } from "~/contact.module.css"
import { type Contact as ContactT, getContact, updateContact } from "~/lib/contact"

export const links = () => [cssLink]

export async function loader({ params }: LoaderArgs) {
  const contact = await getContact(params.contactId!);
  if (!contact) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return contact;
}

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();
  return updateContact(params.contactId!, {
    favorite: formData.get("favorite") === "true",
  });
}

export default function Contact() {
  const contact = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img key={contact.avatar} src={contact.avatar ?? undefined} />
      </div>

      <div>
        <h1 className={styles.title}>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter && (
          <p>
            <a
              target="_blank"
              href={`https://twitter.com/${contact.twitter}`} rel="noreferrer"
            >
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (
                // eslint-disable-next-line no-restricted-globals
                !confirm(
                  "Please confirm you want to delete this record."
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }: { contact: SerializeFrom<ContactT> }) {
  const fetcher = useFetcher();
  let favorite = contact.favorite;
  if (fetcher.submission?.formData) {
    favorite = fetcher.submission.formData.get("favorite") === "true";
  }
  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}