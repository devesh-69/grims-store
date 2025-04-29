
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Extract categories from products
  const categories = Array.from(new Set(products.map((product) => product.category)));

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearchTerm = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;

    // Price filter
    const matchesPriceRange = 
      product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearchTerm && matchesCategory && matchesPriceRange;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange([0, 500]);
  };

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Mobile filter toggle */}
            <div className="w-full md:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="w-full flex items-center justify-center"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {filtersVisible ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Filters sidebar */}
            <div 
              className={`w-full md:w-1/4 lg:w-1/5 space-y-6 ${
                filtersVisible ? "block" : "hidden md:block"
              }`}
            >
              <div>
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="flex items-center text-muted-foreground mb-4"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all filters
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Price Range</Label>
                  <div className="pt-4 px-2">
                    <Slider
                      defaultValue={priceRange}
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value)}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-[250px]"
                  />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductsPage;
