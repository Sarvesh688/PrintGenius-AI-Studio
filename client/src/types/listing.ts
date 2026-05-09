export type ArtworkPlacement = {
    top: number;
    left: number;
    width: number;
    height: number;
    refDisplayWidth: number;
}

export type CreateListingType = {
    templateId: string;
    title: string;
    description: string;
    sellingPrice: number;
    colorIds: string[];
    frontArtworkUrl: string;
    frontArtworkPlacement: ArtworkPlacement;
    backArtworkUrl?: string;
    backArtworkPlacement?: ArtworkPlacement;
}

export type ColorIdsType = {
    _id: string;
    name: string;
    color: string;
    mockupImageUrl: string;
    backMockupImageUrl?: string;
}

export type ListingSingleType = {
    _id: string;
    slug: string;
    title: string;
    description: string;
    sellingPrice: number;
    sizes: string[];
    templateName: string;
    templateType: "TSHIRT" | "HOODIE";
    templateBody: string;
    colorIds: ColorIdsType[];
    frontArtworkUrl?: string;
    backArtworkUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type GetListingBySlugResponse = {
    message: string;
    listing: ListingSingleType;
}