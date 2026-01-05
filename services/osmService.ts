
import { Building, Store } from "../types";

/**
 * Mocking Nairobi-specific geographical data.
 */
export const fetchNearbyBuildings = async (lat: number, lng: number): Promise<Building[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const streets = ["Kenyatta Avenue", "Moi Avenue", "Kimathi Street", "Biashara Street", "Tom Mboya Street", "Ngong Road"];
  const street = streets[Math.floor(Math.random() * streets.length)];

  return [
    {
      id: "b1",
      name: "I&M Bank House",
      address: `Opposite 680 Hotel, ${street}`,
      type: "Commercial Tower",
      lat: lat + 0.0005,
      lng: lng + 0.0005,
      image: "https://images.unsplash.com/photo-1590644300521-1e2474f38714?auto=format&fit=crop&q=80&w=800&h=400"
    },
    {
      id: "b2",
      name: "Sarit Centre",
      address: `Westlands, near ${street}`,
      type: "Shopping Mall",
      lat: lat - 0.001,
      lng: lng + 0.002,
      image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&q=80&w=800&h=400"
    },
    {
      id: "b3",
      name: "Archives Building",
      address: `Next to Hilton, ${street}`,
      type: "Historical/Commercial",
      lat: lat + 0.0015,
      lng: lng - 0.001,
      image: "https://images.unsplash.com/photo-1577086664693-894d8405334a?auto=format&fit=crop&q=80&w=800&h=400"
    }
  ];
};

export const fetchStoresInBuilding = async (buildingId: string): Promise<Store[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const mocks: Record<string, Store[]> = {
    "b1": [
      { id: "s1", buildingId: "b1", name: "Vivo Activewear", category: "Fashion", floor: 1, description: "Stylish Kenyan-designed clothing for women.", rating: 4.8, image: "https://picsum.photos/seed/vivo/400/300" },
      { id: "s2", buildingId: "b1", name: "Artcaffe", category: "Restaurant", floor: 0, description: "Nairobi's favorite spot for coffee and fresh pastries.", rating: 4.7, image: "https://picsum.photos/seed/artcaffe/400/300" },
      { id: "s3", buildingId: "b1", name: "Healthy U", category: "Pharmacy/Health", floor: 2, description: "Vitamins, minerals, and organic supplements.", rating: 4.5, image: "https://picsum.photos/seed/healthyu/400/300" }
    ],
    "b2": [
      { id: "s4", buildingId: "b2", name: "Carrefour Sarit", category: "Supermarket", floor: 0, description: "Your daily grocery needs and electronics.", rating: 4.6, image: "https://picsum.photos/seed/carrefour/400/300" },
      { id: "s5", buildingId: "b2", name: "Bata Kenya", category: "Shoes", floor: 1, description: "Quality footwear for work and school.", rating: 4.4, image: "https://picsum.photos/seed/batakenya/400/300" }
    ],
    "b3": [
      { id: "s6", buildingId: "b3", name: "Savani's Book Centre", category: "Stationery", floor: 1, description: "Everything for your office and school supplies.", rating: 4.9, image: "https://picsum.photos/seed/savanis/400/300" },
      { id: "s7", buildingId: "b3", name: "Amani Curios", category: "Gift Shop", floor: 1, description: "Beautiful handcrafted Kenyan artifacts.", rating: 4.8, image: "https://picsum.photos/seed/curios/400/300" }
    ]
  };

  return mocks[buildingId] || [];
};
