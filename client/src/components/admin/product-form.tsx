import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Product, Category } from "@shared/schema";

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const productSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }),
  categoryId: z.coerce.number().positive({
    message: "Please select a category.",
  }),
  stock: z.coerce.number().nonnegative({
    message: "Stock must be a non-negative number.",
  }),
  color: z.string().optional(),
  material: z.string().optional(),
});

export default function ProductForm({ product, categories, onSubmit, isLoading }: ProductFormProps) {
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      stock: product.stock,
      color: product.color || "",
      material: product.material || "",
    } : {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      stock: 0,
      color: "",
      material: "",
    },
  });

  function handleSubmit(values: z.infer<typeof productSchema>) {
    // If editing, include the product ID
    onSubmit(product ? { id: product.id, ...values } : values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Classic Timepiece" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="Leather" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  className="resize-none h-24" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {field.value && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
            <img 
              src={field.value} 
              alt="Product preview" 
              className="w-full max-w-sm h-auto object-cover rounded-md border" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Invalid+Image+URL";
              }}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{product ? "Update Product" : "Add Product"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
