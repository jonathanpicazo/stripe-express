import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
export const fetchAdmin = async (query: string, variables?: any) => {
  try {
    const shopName = process.env.SHOPIFY_STORE as string;
    const adminToken = process.env.SHOPIFY_ADMIN_TOKEN as string;
    const url = new URL(`https://${shopName}/api/2021-07/graphql`);
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query, variables }),
    };
    const res = await fetch(url, options);
    const resJson = await res.json();
    return resJson.data;
  } catch (error) {
    console.log("error while fetching products", error);
  }
};
