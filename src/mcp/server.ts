import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { boolean, z } from "zod";
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

server.registerTool(
    "add_product",
    {
        title: "Add Product",
        description:
            "Create a new product with sku, name, (optional) description, price and quantity",
        inputSchema: {
            sku: z.string().min(1),
            name: z.string().min(1),
            description: z.string().optional().nullable(),
            price: z.number().nonnegative(),
            quantity: z.number().int().nonnegative(),
        },
        outputSchema: ProductScheme.shape,
    },
    async ({ sku, name, description, price, quantity }) => {
        const created = await svc.addProduct({
            sku,
            name,
            description,
            price,
            quantity,
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
                isError: true
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

// Start Communication with Client
(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})();
