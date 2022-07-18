import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";

React.startTransition(() => {
  hydrateRoot(
    document,
    <React.StrictMode>
      <RemixBrowser />
    </React.StrictMode>
  );
});
