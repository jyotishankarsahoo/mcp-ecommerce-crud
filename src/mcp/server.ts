#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ProductService } from "../services/ProductService.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "mcp-ecommerce-crud",
    version: "1.0.0",
});
const svc = new ProductService();

const ProductScheme = z.object({
    id: z.number().int().positive().optional(),
    sku: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    price: z.union([z.string(), z.number()]),
    quantity: z.number().int().positive(),
    created_at: z.union([z.string(), z.date()]).optional(),
    updated_at: z.union([z.string(), z.date()]).optional(),
});

const Product_Input_Scheme = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
});

server.registerTool(
    "add_product",
    {
        title: "Add Product",
        description:
            "Create a new product with sku, name, (optional) description, price and quantity",
        inputSchema: Product_Input_Scheme.shape,
        outputSchema: ProductScheme.shape,
    },
    async (raw) => {
        const product_details = Product_Input_Scheme.parse(raw);
        const created = await svc.addProduct({
            ...product_details,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(created) }],
            structuredContent: created as any,
        };
    }
);

server.registerTool(
    "get_product_by_Id",
    {
        title: "Get Product By ID",
        description: "It will fetch a single Product by numeric ID",
        inputSchema: {
            id: z.number().int().positive(),
        },
        outputSchema: ProductScheme.shape,
    },
    async ({ id }) => {
        const product = await svc.getProductById(id);
        if (!product) {
            return {
                content: [{ type: "text", text: `Product ${id} not found` }],
                isError: true,
            };
        }
        return {
            content: [{ type: "text", text: JSON.stringify(product) }],
            structuredContent: product as any,
        };
    }
);

server.registerTool(
    "delete_product_by_id",
    {
        title: "Delete Product",
        description:
            "Delete Product by given Product ID. Returns { deleted: boolean }.",
        inputSchema: {
            id: z.number().int().positive(),
        },
        outputSchema: {
            deleted: z.boolean(),
        },
    },
    async ({ id }) => {
        const is_deleted = await svc.deleteProduct(id);
        if (!is_deleted) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Unable to Delete Product with ID: ${id}`,
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                { type: "text", text: JSON.stringify({ deleted: is_deleted }) },
            ],
            structuredContent: is_deleted as any,
        };
    }
);
server.registerTool(
    "add-product-smart",
    {
        title: "Add Product (AI Enhanced)",
        description: "Add Product Description if missing using AI",
        inputSchema: Product_Input_Scheme.shape,
        outputSchema: ProductScheme.shape,
    },
    async (raw) => {
        const product_details = Product_Input_Scheme.parse(raw);
        let finalDescription = product_details.description;
        if (!finalDescription) {
            const ai_prompt = `Write a 2-3 sentence product description for ${product_details.name} with price ${product_details.price}`;
            const response = await server.server.createMessage({
                messages: [
                    {
                        role: "user",
                        content: { type: "text", text: ai_prompt },
                    },
                ],
                maxTokens: 100,
            });
            if (response.content.type === "text") {
                finalDescription = response.content.text;
            } else {
                // Handle cases where the AI might return an image or something else
                throw new Error(
                    `Expected text from AI, but received ${response.content.type}`
                );
            }
        }
        const created = await svc.addProduct({
            ...product_details,
            description: finalDescription,
        });
        return {
            content: [{ type: "text", text: JSON.stringify(created) }],
            structuredContent: created as any,
        };
    }
);
server.registerResource(
    "product-catalog",
    "product://catalog",
    {
        description: "Browse All Products in the catalog",
    },
    async (uri) => {
        const product_list = await svc.listProducts(200, 0);
        return {
            contents: [
                {
                    uri: uri.href,
                    type: "text",
                    text: JSON.stringify(product_list),
                },
            ],
        };
    }
);

server.registerResource(
    "product-low-inventory",
    "product://lowInventory",
    {
        description: "Provides Product list with low number of inventory",
    },
    async (uri) => {
        const product_list = await svc.listProducts(100, 0);
        const low_inventory_product = product_list.filter(
            (product) => product.quantity < 5
        );
        return {
            contents: [
                {
                    uri: uri.href,
                    type: "text",
                    text: JSON.stringify(low_inventory_product),
                },
            ],
        };
    }
);
server.registerPrompt(
    "Generate-Product-Description-Template",
    {
        title: "Generate Product desc Template",
        description: "Create a compelling Description for ecommerce product",
        argsSchema: {
            productName: z.string().describe("Name of the product"),
            features: z
                .string()
                .optional()
                .describe("Key features of the product"),
            targetAudience: z.string().optional().describe("Demographic"),
        },
    },
    ({ productName, features, targetAudience }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Generate a compelling e-commerce product description for ${productName}.
${features ? `Key Features:\n${features}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}

Please create:
1. A catchy headline (5-8 words)
2. A detailed description (2-3 paragraphs)
3. 2-3 bullet points highlighting key benefits
4. A call to action

Make it engaging, SEO-friendly, and persuasive.`,
                    },
                },
            ],
        };
    }
);
// Start Communication with Client
(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})();
