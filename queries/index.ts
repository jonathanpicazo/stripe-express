import dotenv from "dotenv";
dotenv.config();
const customerEmail = process.env.CUSTOMER_TEST_EMAIL as string;
const customerId = process.env.CUSTOMER_TEST_ID as string;
const variantId = process.env.CUSTOMER_TEST_ITEM_VARIANT_ID as string;
export const draftOrderCreate = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        # DraftOrder fields
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const draftOrderComplete = `
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        # DraftOrder fields
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const draftCreateVariables = {
  customerId: `gid://shopify/Customer/${customerId}`,
  note: "Test draft order",
  email: customerEmail,
  taxExempt: true,
  shippingLine: {
    title: "Custom Shipping",
    price: 4.55,
  },
  shippingAddress: {
    address1: "123 Main St",
    city: "Waterloo",
    province: "Ontario",
    country: "Canada",
    zip: "A1A 1A1",
  },
  billingAddress: {
    address1: "456 Main St",
    city: "Toronto",
    province: "Ontario",
    country: "Canada",
    zip: "Z9Z 9Z9",
  },
  lineItems: [
    {
      variantId: `gid://shopify/ProductVariant/${variantId}`,
      quantity: 2,
    },
  ],
};
