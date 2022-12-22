import dotenv from "dotenv";
// import axios from "axios";
import fetch from "node-fetch";

dotenv.config();
export const fetchAdmin = async (query: string, variables?: any) => {
  try {
    const shopName = process.env.SHOPIFY_STORE as string;
    const adminToken = process.env.SHOPIFY_ADMIN_TOKEN as string;
    const url = `https://${shopName}/admin/api/2022-10/graphql`;
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
    const resJson = await res.json()
    //console.log("res", res);
    console.log('variables', variables)
    console.log('resJson', resJson)
    console.log("res data", resJson.data);
    return resJson.data;
    // const resJson = await res.json();
    // return resJson.data;
  } catch (error) {
    console.log("error while fetching products", error);
  }
};
