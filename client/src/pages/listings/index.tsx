import { useQuery } from "@tanstack/react-query";
import { getListingQueryFn } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

const ListingsPage = () => {
  const { data: listingData, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: getListingQueryFn,
  });

  const listings = listingData?.listings ?? []


  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl w-full mx-auto px-3 lg:p-0 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage your active listings.</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell>
                </TableRow>
              ))
            ) : listings.map((listing: any) => (
              <TableRow key={listing._id}>
                <TableCell className="flex items-center gap-3">
                  <div className="border rounded-sm pt-2 px-2">
                    <img src={listing.artworkUrl} alt={listing.title} className="w-10 h-10 rounded object-cover" />
                  </div>
                  <div >
                    <h5 className=" font-medium">{listing.title}</h5>
                    <p className="max-w-[300px] mt-px text-muted-foreground text-xs w-full truncate">{listing.description}</p>
                  </div>
                </TableCell>
                <TableCell>${listing.sellingPrice}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/listing/${listing.slug}`} target="_blank">
                      <Link2 className="w-4 h-4 mr-1" /> Share Link
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListingsPage;
