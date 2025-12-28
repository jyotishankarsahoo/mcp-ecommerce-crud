import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import {z} from "zod"
import { ProductService } from "../services/ProductService.js";

const server = new McpServer({
    name: "mcp-ecommerce-crud",
    version: "1.0.0"
})
const svc = new ProductService()

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
        outputSchema: ProductScheme.shape
    },
    async({sku, name, description, price, quantity}) => {
        const created = await svc.addProduct({ sku, name, description, price, quantity });
        return {
            content: [{ type: "text", text: JSON.stringify(created) }],
            structuredContent: created as any
        };
    }
);