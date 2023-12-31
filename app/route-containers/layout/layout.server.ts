import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import commerce from "~/commerce.server";
import { getSession } from "~/session.server";
import { getTranslations } from "~/translations.server";

function time<T>(label: string) {
  console.time(label);
  return (r: T) => {
    console.timeEnd(label);
    return r;
  };
}

export async function loader({ request, params }: LoaderArgs) {
  let session = await getSession(request, params);
  let lang = session.getLanguage();
  let [categories, pages, cart, wishlist] = await Promise.all([
    commerce.getCategories(lang, 2).then(time("get categories root")),
    commerce.getPages(lang).then(time("get pages root")),
    session
      .getCart()
      .then((cartItems) => commerce.getCartInfo(lang, cartItems))
      .then(time("get cart info root")),
    session
      .getWishlist()
      .then((wishlistItems) => commerce.getWishlistInfo(lang, wishlistItems))
      .then(time("get wishlist info root")),
  ]).then(time("get all root"));

  let translations = getTranslations(lang, [
    "All",
    "Cart",
    "Close",
    "Close Menu",
    "Home",
    "Open Menu",
    "Search for products...",
    "Store Name",
    "Wishlist",
    "Looks like your language doesn't match",
    "Would you like to switch to $1?",
    "Yes",
    "No",
    "Your cart is empty",
    "Quantity: $1",
    "Remove from cart",
    "Subtract item",
    "Add item",
    "Proceed to checkout",
    "Subtotal",
    "Total",
    "Taxes",
    "Shipping",
    "Your wishlist is empty",
    "Remove from wishlist",
    "Move to cart",
  ]);

  return json({
    cart,
    lang,
    pages: [
      {
        id: "home",
        title: translations.Home,
        to: `/${lang}`,
      },
      ...(await pages).map(({ id, slug, title }) => ({
        id,
        title,
        to: `/${lang}/${slug}`,
      })),
    ],
    categories: [
      ...(await categories).map(({ name, slug }) => ({
        name,
        to: `${lang}/search?category=${slug}`,
      })),
    ],
    translations,
    wishlist,
  });
}
