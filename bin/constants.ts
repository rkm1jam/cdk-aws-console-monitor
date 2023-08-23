import { NamedEnvironment } from "../lib/deployment";

/**
 * Organization-specific prefix for tags
 */
const tag_prefix = "dot";
const product = "myprod";
const component = "governance";
const contact = "Infrastructure Team";

export const constants = {
  product: product,
  component: component,
};

/**
 * Global tags all resources should have
 * @param env
 * @returns
 */
export function getGlobalTags(env: NamedEnvironment): {
  [key: string]: string;
} {
  return {
    [`${tag_prefix}:product`]: product,
    [`${tag_prefix}:component`]: component,
    [`${tag_prefix}:contact`]: contact,
    [`${tag_prefix}:environment`]: env.name,
  };
}
