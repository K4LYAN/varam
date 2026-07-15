export interface Product {
  id: number;
  name: string;
  price: number;
  volume: string;
  category: string;
  description: string;
  image: string;
  imageColor: string;
  accentColor: string;
  benefits: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Wood Pressed Groundnut Oil",
    price: 350,
    volume: "1 Liter",
    category: "Everyday Cooking",
    description: "Extracted using traditional wooden ghani. Retains all natural nutrients and real peanut aroma. Perfect for deep frying.",
    image: "/images/groundnut_oil.png",
    imageColor: "bg-[#F3E5AB]", 
    accentColor: "text-[#8B5A2B]",
    benefits: ["Rich in Vitamin E", "Cholesterol Free"]
  },
  {
    id: 2,
    name: "Wood Pressed Sesame Oil",
    price: 480,
    volume: "1 Liter",
    category: "Heritage Collection",
    description: "Rich in antioxidants. Extracted from premium black sesame seeds with palm jaggery. Excellent for health and tradition.",
    image: "/images/sesame_oil.png",
    imageColor: "bg-[#E6D5C3]",
    accentColor: "text-[#5C4033]",
    benefits: ["Heart Healthy", "Bone Strength"]
  },
  {
    id: 3,
    name: "Cold Pressed Coconut Oil",
    price: 320,
    volume: "1 Liter",
    category: "Versatile Essential",
    description: "Pure, unrefined, and unbleached. Made from sun-dried copra. Ideal for cooking, hair care, and skin nourishment.",
    image: "/images/coconut_oil.png",
    imageColor: "bg-[#F5F5F0]",
    accentColor: "text-[#4A5D23]",
    benefits: ["MCT Rich", "Deep Moisturizing"]
  },
  {
    id: 4,
    name: "Cold Pressed Mustard Oil",
    price: 280,
    volume: "1 Liter",
    category: "Robust Flavor",
    description: "Strong, pungent flavor typical of authentic mustard oil. Cold pressed to preserve its natural pungency and health benefits.",
    image: "/images/mustard_oil.png",
    imageColor: "bg-[#FAD6A5]",
    accentColor: "text-[#B8860B]",
    benefits: ["Boosts Immunity", "Improves Circulation"]
  },
  {
    id: 5,
    name: "Cold Pressed Castor Oil",
    price: 250,
    volume: "500 ml",
    category: "Wellness & Care",
    description: "Thick, nutrient-rich oil. Perfect for hair growth, skin moisturizing, and traditional wellness practices.",
    image: "/images/castor_oil.png",
    imageColor: "bg-[#E8E4C9]",
    accentColor: "text-[#6B8E23]",
    benefits: ["Promotes Hair Growth", "Skin Healing"]
  },
  {
    id: 6,
    name: "Sweet Almond Oil",
    price: 850,
    volume: "250 ml",
    category: "Premium Beauty",
    description: "100% pure sweet almond oil. Excellent for glowing skin, dark circles, and baby massage. Unrefined and pure.",
    image: "/images/almond_oil.png",
    imageColor: "bg-[#FAEBD7]",
    accentColor: "text-[#D2691E]",
    benefits: ["Reduces Dark Circles", "Baby Safe"]
  }
];
