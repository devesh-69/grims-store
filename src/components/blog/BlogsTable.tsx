
import { useState } from "react";
import { Blog } from "@/types/blog";
import { BlogsTableProps } from "@/types/blog-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Edit, Trash, MoreHorizontal, Search } from "lucide-react";
import { format } from "date-fns";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export function BlogsTable({ blogs, onEdit, onDelete, onView }: BlogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(blog.category) ? 
        blog.category.some(cat => typeof cat === 'string' && cat.toLowerCase().includes(searchTerm.toLowerCase())) : 
        false)
  );

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const confirmDelete = (id: string) => {
    setBlogToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (blogToDelete) {
      onDelete(blogToDelete);
      setBlogToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background text-foreground border-border shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-secondary">
        <Table>
          <TableHeader className="bg-secondary text-foreground">
            <TableRow>
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="hidden md:table-cell text-foreground">Category</TableHead>
              <TableHead className="hidden lg:table-cell text-foreground">Author</TableHead>
              <TableHead className="hidden sm:table-cell text-foreground">Published</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No blog posts found
                </TableCell>
              </TableRow>
            ) : (
              paginatedBlogs.map((blog) => (
                <TableRow key={blog.id} className="border-b border-border hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center space-x-3">
                      <div className="hidden sm:block h-12 w-12 rounded overflow-hidden shrink-0 border border-border">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[200px] lg:max-w-md">
                        <p className="font-medium truncate">{blog.title}</p>
                        <p className="text-sm text-muted-foreground truncate hidden sm:block">
                          {blog.excerpt.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {Array.isArray(blog.category) ? blog.category.join(", ") : (blog.category || "Uncategorized")}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-full overflow-hidden border border-border">
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="text-sm">{blog.author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {format(new Date(blog.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border-border text-foreground">
                        <DropdownMenuItem onClick={() => onView(blog.id)} className="hover:bg-muted/50 cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(blog)} className="hover:bg-muted/50 cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(blog.id)} className="hover:bg-muted/50 cursor-pointer focus:bg-destructive focus:text-destructive-foreground text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent className="bg-background border border-border rounded-lg px-4 py-2">
            <PaginationItem>
              <PaginationPrevious 
                onClick={handlePrevious} 
                className={`text-foreground hover:bg-muted/50 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`} 
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground hover:bg-muted/50"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={handleNext}
                className={`text-foreground hover:bg-muted/50 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}

              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
