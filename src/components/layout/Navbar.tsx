
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ShoppingBag, BookOpen, User, Menu, X, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Fuse from 'fuse.js';
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/api/products";
import { Product } from "@/types/product";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch products using React Query
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]> ({
    queryKey: ['all-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const fuse = useMemo(() => {
    const options = {
      keys: ['name', 'short_description', 'detailed_description', 'category.name'], // Include relevant keys
      threshold: 0.3,
    };
    // Initialize Fuse with fetched products (or an empty array if loading/error)
    return new Fuse(products || [], options);
  }, [products]); // Depend on fetched products data

  // Effect to clear search results when products data changes (e.g., after refetch)
  useEffect(() => {
    setSearchResults([]);
  }, [products]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1 && products) { // Only search if products are loaded
      const results = fuse.search(query);
      setSearchResults(results.map(result => result.item));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (productId: string) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/products/${productId}`);
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="mr-2 h-4 w-4" /> },
    { name: "Products", path: "/products", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
    { name: "Blog", path: "/blog", icon: <BookOpen className="mr-2 h-4 w-4" /> }
  ];

  // Only show Admin Dashboard for users with admin privileges
  if (user?.isAdmin) {
    navItems.push({ name: "Admin Dashboard", path: "/admin", icon: <User className="mr-2 h-4 w-4" /> });
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left section: Logo and Nav Items */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Grim's Store</span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center text-foreground/80 hover:text-primary transition-colors"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right section: Search, Wishlist, and Auth/User */}
        <div className="hidden md:flex items-center space-x-6">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isLoadingProducts ? "Loading products..." : "Search products..."}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isLoadingProducts} // Disable search while loading products
              />
              {searchResults.length > 0 && searchQuery.length > 1 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto top-full left-0">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center"
                      onClick={() => handleSelectResult(product.id)}
                    >
                      <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-8 h-8 object-cover rounded-md mr-2" />
                      {product.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
             {user && (
               <Button variant="ghost" size="icon" onClick={() => navigate('/wishlist')} aria-label="Wishlist">
                 <ShoppingBag className="h-5 w-5" />
               </Button>
             )}
          {/* Auth/User section (Desktop) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 flex items-center justify-center space-x-2 px-0">
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt="User Avatar" /> 
                    <AvatarFallback>{user.email ? user.email.charAt(0).toUpperCase() : <User className="h-5 w-5" />}</AvatarFallback>
                  </Avatar>
                  {/* Display user's first name or email */}
                  <span className="text-sm font-medium hidden sm:block">{user.user_metadata?.first_name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                     {/* Display user's name or email and full email */}
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.first_name || user.email}</p>
                    {user.user_metadata?.first_name && (<p className="text-xs leading-none text-muted-foreground">{user.email}</p>)}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button and Wishlist Icon */}
        <div className="flex items-center md:hidden">
           {user && (
               <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate('/wishlist')} aria-label="Wishlist">
                 <ShoppingBag className="h-5 w-5" />
               </Button>
             )}
            <button
              className="text-foreground"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
             {/* Search Bar (Mobile) */}
             <div className="relative w-full mb-2">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={isLoadingProducts ? "Loading products..." : "Search products..."}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={isLoadingProducts} // Disable search while loading products
                />
                {searchResults.length > 0 && searchQuery.length > 1 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto top-full left-0">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center"
                        onClick={() => handleSelectResult(product.id)}
                      >
                        <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="w-8 h-8 object-cover rounded-md mr-2" />
                        {product.name}
                      </div>
                    ))
                  }

                  {/* Add a loading indicator or message if products are still loading */}
                  {isLoadingProducts && searchResults.length === 0 && searchQuery.length > 1 && (
                     <div className="px-4 py-2 text-muted-foreground">Loading...</div>
                  )}

                  {!isLoadingProducts && searchResults.length === 0 && searchQuery.length > 1 && (
                     <div className="px-4 py-2 text-muted-foreground">No products found.</div>
                  )}
                </div>
              )}
             </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center p-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <hr className="border-border" />
            <div className="flex flex-col space-y-2">
              {user ? (
                 <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out ({user.email})
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
