// src/data/foods.ts
export interface FoodData {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  servingWeight: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export const foods: FoodData[] = [
  // PROTEINS
  { id: 'p001', name: 'Chicken Breast (Grilled)', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
  { id: 'p002', name: 'Chicken Thigh (Skin-on)', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 84 },
  { id: 'p003', name: 'Salmon Fillet', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
  { id: 'p004', name: 'Tuna (Canned in Water)', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 338 },
  { id: 'p005', name: 'Ground Beef (90% lean)', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 176, protein: 20, carbs: 0, fat: 10, fiber: 0, sugar: 0, sodium: 66 },
  { id: 'p006', name: 'Ground Turkey', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 170, protein: 21, carbs: 0, fat: 9, fiber: 0, sugar: 0, sodium: 72 },
  { id: 'p007', name: 'Eggs (Whole, Large)', category: 'proteins', servingSize: '1 egg (50g)', servingWeight: 50, calories: 72, protein: 6, carbs: 0.4, fat: 5, fiber: 0, sugar: 0.2, sodium: 71 },
  { id: 'p008', name: 'Egg Whites', category: 'proteins', servingSize: '3 whites (99g)', servingWeight: 99, calories: 51, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 164 },
  { id: 'p009', name: 'Shrimp', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0, sodium: 111 },
  { id: 'p010', name: 'Tilapia', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, sugar: 0, sodium: 52 },
  { id: 'p011', name: 'Pork Tenderloin', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 143, protein: 26, carbs: 0, fat: 3.5, fiber: 0, sugar: 0, sodium: 48 },
  { id: 'p012', name: 'Tofu (Firm)', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
  { id: 'p013', name: 'Tempeh', category: 'proteins', servingSize: '100g', servingWeight: 100, calories: 192, protein: 20, carbs: 7.6, fat: 11, fiber: 0, sugar: 0, sodium: 9 },
  { id: 'p014', name: 'Cottage Cheese (Low-fat)', category: 'proteins', servingSize: '1 cup (226g)', servingWeight: 226, calories: 183, protein: 28, carbs: 6, fat: 5, fiber: 0, sugar: 6, sodium: 918 },
  { id: 'p015', name: 'Greek Yogurt (Plain, Non-fat)', category: 'proteins', servingSize: '170g', servingWeight: 170, calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 6, sodium: 56 },
  { id: 'p016', name: 'Whey Protein Shake', category: 'proteins', servingSize: '1 scoop (30g)', servingWeight: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, sugar: 2, sodium: 130 },
  { id: 'p017', name: 'Beef Steak (Sirloin)', category: 'proteins', servingSize: '170g (6oz)', servingWeight: 170, calories: 316, protein: 48, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 102 },
  { id: 'p018', name: 'Turkey Breast (Deli)', category: 'proteins', servingSize: '56g (2oz)', servingWeight: 56, calories: 62, protein: 12, carbs: 2, fat: 0.6, fiber: 0, sugar: 2, sodium: 528 },
  { id: 'p019', name: 'Lentils (Cooked)', category: 'proteins', servingSize: '1 cup (198g)', servingWeight: 198, calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16, sugar: 3.6, sodium: 4 },
  { id: 'p020', name: 'Chickpeas (Cooked)', category: 'proteins', servingSize: '1 cup (164g)', servingWeight: 164, calories: 269, protein: 15, carbs: 45, fat: 4.2, fiber: 12, sugar: 8, sodium: 11 },

  // GRAINS
  { id: 'g001', name: 'White Rice (Cooked)', category: 'grains', servingSize: '1 cup (158g)', servingWeight: 158, calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0, sodium: 2 },
  { id: 'g002', name: 'Brown Rice (Cooked)', category: 'grains', servingSize: '1 cup (195g)', servingWeight: 195, calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.7, sodium: 10 },
  { id: 'g003', name: 'Pasta (Cooked)', category: 'grains', servingSize: '1 cup (140g)', servingWeight: 140, calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, sugar: 0.8, sodium: 1 },
  { id: 'g004', name: 'Whole Wheat Bread', category: 'grains', servingSize: '1 slice (28g)', servingWeight: 28, calories: 69, protein: 3.6, carbs: 12, fat: 1, fiber: 1.9, sugar: 1.4, sodium: 132 },
  { id: 'g005', name: 'White Bread', category: 'grains', servingSize: '1 slice (25g)', servingWeight: 25, calories: 67, protein: 2, carbs: 13, fat: 0.8, fiber: 0.6, sugar: 1.3, sodium: 142 },
  { id: 'g006', name: 'Oatmeal (Cooked)', category: 'grains', servingSize: '1 cup (234g)', servingWeight: 234, calories: 154, protein: 5.4, carbs: 27, fat: 2.6, fiber: 4, sugar: 1.1, sodium: 115 },
  { id: 'g007', name: 'Quinoa (Cooked)', category: 'grains', servingSize: '1 cup (185g)', servingWeight: 185, calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5.2, sugar: 1.6, sodium: 13 },
  { id: 'g008', name: 'Flour Tortilla', category: 'grains', servingSize: '1 medium (45g)', servingWeight: 45, calories: 140, protein: 3.6, carbs: 24, fat: 3.5, fiber: 1.3, sugar: 1, sodium: 331 },
  { id: 'g009', name: 'Bagel', category: 'grains', servingSize: '1 medium (105g)', servingWeight: 105, calories: 270, protein: 10, carbs: 53, fat: 1.6, fiber: 2.3, sugar: 6, sodium: 430 },
  { id: 'g010', name: 'Granola', category: 'grains', servingSize: '½ cup (60g)', servingWeight: 60, calories: 280, protein: 6, carbs: 38, fat: 12, fiber: 3, sugar: 14, sodium: 15 },
  { id: 'g011', name: 'Couscous (Cooked)', category: 'grains', servingSize: '1 cup (157g)', servingWeight: 157, calories: 176, protein: 6, carbs: 36, fat: 0.3, fiber: 2.2, sugar: 0.2, sodium: 8 },
  { id: 'g012', name: 'Sweet Potato (Baked)', category: 'grains', servingSize: '1 medium (114g)', servingWeight: 114, calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, sugar: 7.4, sodium: 41 },
  { id: 'g013', name: 'Regular Potato (Baked)', category: 'grains', servingSize: '1 medium (173g)', servingWeight: 173, calories: 161, protein: 4.3, carbs: 37, fat: 0.2, fiber: 3.8, sugar: 2, sodium: 17 },
  { id: 'g014', name: 'Corn (Cooked)', category: 'grains', servingSize: '1 ear (90g)', servingWeight: 90, calories: 77, protein: 2.9, carbs: 17, fat: 1.1, fiber: 2.4, sugar: 2.9, sodium: 1 },

  // FRUITS
  { id: 'f001', name: 'Banana', category: 'fruits', servingSize: '1 medium (118g)', servingWeight: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, sodium: 1 },
  { id: 'f002', name: 'Apple', category: 'fruits', servingSize: '1 medium (182g)', servingWeight: 182, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2 },
  { id: 'f003', name: 'Orange', category: 'fruits', servingSize: '1 medium (131g)', servingWeight: 131, calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, sugar: 12, sodium: 0 },
  { id: 'f004', name: 'Strawberries', category: 'fruits', servingSize: '1 cup (152g)', servingWeight: 152, calories: 49, protein: 1, carbs: 12, fat: 0.5, fiber: 3, sugar: 7.4, sodium: 1 },
  { id: 'f005', name: 'Blueberries', category: 'fruits', servingSize: '1 cup (148g)', servingWeight: 148, calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6, sugar: 15, sodium: 1 },
  { id: 'f006', name: 'Mango', category: 'fruits', servingSize: '1 cup (165g)', servingWeight: 165, calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, sugar: 23, sodium: 2 },
  { id: 'f007', name: 'Avocado', category: 'fruits', servingSize: '½ medium (68g)', servingWeight: 68, calories: 114, protein: 1.3, carbs: 6, fat: 10, fiber: 5, sugar: 0.5, sodium: 5 },
  { id: 'f008', name: 'Grapes', category: 'fruits', servingSize: '1 cup (151g)', servingWeight: 151, calories: 104, protein: 1.1, carbs: 27, fat: 0.2, fiber: 1.4, sugar: 23, sodium: 3 },
  { id: 'f009', name: 'Watermelon', category: 'fruits', servingSize: '1 cup (152g)', servingWeight: 152, calories: 46, protein: 0.9, carbs: 12, fat: 0.2, fiber: 0.6, sugar: 9.4, sodium: 2 },
  { id: 'f010', name: 'Pineapple', category: 'fruits', servingSize: '1 cup (165g)', servingWeight: 165, calories: 82, protein: 0.9, carbs: 22, fat: 0.2, fiber: 2.3, sugar: 16, sodium: 2 },
  { id: 'f011', name: 'Peach', category: 'fruits', servingSize: '1 medium (150g)', servingWeight: 150, calories: 59, protein: 1.4, carbs: 14, fat: 0.4, fiber: 2.3, sugar: 13, sodium: 0 },
  { id: 'f012', name: 'Pear', category: 'fruits', servingSize: '1 medium (178g)', servingWeight: 178, calories: 102, protein: 0.6, carbs: 27, fat: 0.2, fiber: 5.5, sugar: 17, sodium: 2 },

  // VEGETABLES
  { id: 'v001', name: 'Broccoli (Cooked)', category: 'vegetables', servingSize: '1 cup (156g)', servingWeight: 156, calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.1, sugar: 2.2, sodium: 64 },
  { id: 'v002', name: 'Spinach (Raw)', category: 'vegetables', servingSize: '1 cup (30g)', servingWeight: 30, calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, sugar: 0.1, sodium: 24 },
  { id: 'v003', name: 'Carrots', category: 'vegetables', servingSize: '1 medium (61g)', servingWeight: 61, calories: 25, protein: 0.6, carbs: 6, fat: 0.1, fiber: 1.7, sugar: 2.9, sodium: 42 },
  { id: 'v004', name: 'Bell Pepper (Red)', category: 'vegetables', servingSize: '1 medium (119g)', servingWeight: 119, calories: 37, protein: 1.2, carbs: 7, fat: 0.4, fiber: 2.5, sugar: 5, sodium: 5 },
  { id: 'v005', name: 'Tomato', category: 'vegetables', servingSize: '1 medium (123g)', servingWeight: 123, calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, sugar: 3.2, sodium: 6 },
  { id: 'v006', name: 'Cucumber', category: 'vegetables', servingSize: '1 cup (104g)', servingWeight: 104, calories: 16, protein: 0.7, carbs: 3.1, fat: 0.2, fiber: 0.5, sugar: 1.7, sodium: 2 },
  { id: 'v007', name: 'Green Beans (Cooked)', category: 'vegetables', servingSize: '1 cup (125g)', servingWeight: 125, calories: 44, protein: 2.4, carbs: 10, fat: 0.4, fiber: 4, sugar: 2, sodium: 1 },
  { id: 'v008', name: 'Kale (Chopped)', category: 'vegetables', servingSize: '1 cup (67g)', servingWeight: 67, calories: 33, protein: 2.9, carbs: 6, fat: 0.6, fiber: 1.3, sugar: 0, sodium: 25 },
  { id: 'v009', name: 'Cauliflower (Cooked)', category: 'vegetables', servingSize: '1 cup (124g)', servingWeight: 124, calories: 29, protein: 2.3, carbs: 5.1, fat: 0.6, fiber: 2.9, sugar: 2.4, sodium: 19 },
  { id: 'v010', name: 'Asparagus (Cooked)', category: 'vegetables', servingSize: '1 cup (180g)', servingWeight: 180, calories: 40, protein: 4.3, carbs: 7, fat: 0.4, fiber: 3.6, sugar: 2.5, sodium: 25 },
  { id: 'v011', name: 'Mushrooms (Sliced)', category: 'vegetables', servingSize: '1 cup (70g)', servingWeight: 70, calories: 15, protein: 2.2, carbs: 2.3, fat: 0.2, fiber: 0.7, sugar: 1.4, sodium: 4 },
  { id: 'v012', name: 'Onion (Chopped)', category: 'vegetables', servingSize: '1 medium (110g)', servingWeight: 110, calories: 44, protein: 1.2, carbs: 10, fat: 0.1, fiber: 1.9, sugar: 4.7, sodium: 4 },
  { id: 'v013', name: 'Zucchini', category: 'vegetables', servingSize: '1 medium (196g)', servingWeight: 196, calories: 33, protein: 2.4, carbs: 6, fat: 0.6, fiber: 2, sugar: 5, sodium: 16 },
  { id: 'v014', name: 'Lettuce (Romaine)', category: 'vegetables', servingSize: '1 cup (47g)', servingWeight: 47, calories: 8, protein: 0.6, carbs: 1.5, fat: 0.1, fiber: 1, sugar: 0.6, sodium: 4 },

  // DAIRY
  { id: 'd001', name: 'Whole Milk', category: 'dairy', servingSize: '1 cup (244ml)', servingWeight: 244, calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12, sodium: 105 },
  { id: 'd002', name: 'Skim Milk', category: 'dairy', servingSize: '1 cup (245ml)', servingWeight: 245, calories: 83, protein: 8, carbs: 12, fat: 0.2, fiber: 0, sugar: 12, sodium: 103 },
  { id: 'd003', name: 'Cheddar Cheese', category: 'dairy', servingSize: '1 oz (28g)', servingWeight: 28, calories: 113, protein: 7, carbs: 0.4, fat: 9, fiber: 0, sugar: 0.1, sodium: 176 },
  { id: 'd004', name: 'Mozzarella Cheese', category: 'dairy', servingSize: '1 oz (28g)', servingWeight: 28, calories: 85, protein: 6, carbs: 0.7, fat: 6, fiber: 0, sugar: 0.3, sodium: 138 },
  { id: 'd005', name: 'Butter', category: 'dairy', servingSize: '1 tbsp (14g)', servingWeight: 14, calories: 102, protein: 0.1, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 2 },
  { id: 'd006', name: 'Cream Cheese', category: 'dairy', servingSize: '2 tbsp (29g)', servingWeight: 29, calories: 99, protein: 1.7, carbs: 1.6, fat: 10, fiber: 0, sugar: 0.8, sodium: 85 },
  { id: 'd007', name: 'Plain Yogurt', category: 'dairy', servingSize: '1 cup (245g)', servingWeight: 245, calories: 149, protein: 8.5, carbs: 11, fat: 8, fiber: 0, sugar: 11, sodium: 113 },
  { id: 'd008', name: 'Almond Milk (Unsweetened)', category: 'dairy', servingSize: '1 cup (240ml)', servingWeight: 240, calories: 30, protein: 1, carbs: 1, fat: 2.5, fiber: 0.5, sugar: 0, sodium: 170 },

  // NUTS & SEEDS
  { id: 'n001', name: 'Almonds', category: 'nuts_seeds', servingSize: '¼ cup (36g)', servingWeight: 36, calories: 207, protein: 7.6, carbs: 7.7, fat: 18, fiber: 4.5, sugar: 1.6, sodium: 0 },
  { id: 'n002', name: 'Peanut Butter', category: 'nuts_seeds', servingSize: '2 tbsp (32g)', servingWeight: 32, calories: 188, protein: 7, carbs: 7, fat: 16, fiber: 1.6, sugar: 3, sodium: 136 },
  { id: 'n003', name: 'Walnuts', category: 'nuts_seeds', servingSize: '¼ cup (30g)', servingWeight: 30, calories: 196, protein: 4.6, carbs: 4.1, fat: 20, fiber: 2, sugar: 0.8, sodium: 1 },
  { id: 'n004', name: 'Chia Seeds', category: 'nuts_seeds', servingSize: '2 tbsp (28g)', servingWeight: 28, calories: 137, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, sugar: 0, sodium: 5 },
  { id: 'n005', name: 'Cashews', category: 'nuts_seeds', servingSize: '¼ cup (32g)', servingWeight: 32, calories: 176, protein: 5.2, carbs: 9.3, fat: 14, fiber: 1, sugar: 1.7, sodium: 4 },
  { id: 'n006', name: 'Sunflower Seeds', category: 'nuts_seeds', servingSize: '¼ cup (35g)', servingWeight: 35, calories: 204, protein: 7.3, carbs: 7, fat: 18, fiber: 3, sugar: 0.9, sodium: 1 },
  { id: 'n007', name: 'Pumpkin Seeds', category: 'nuts_seeds', servingSize: '¼ cup (30g)', servingWeight: 30, calories: 170, protein: 9, carbs: 4, fat: 14, fiber: 1.7, sugar: 0.4, sodium: 5 },
  { id: 'n008', name: 'Almond Butter', category: 'nuts_seeds', servingSize: '2 tbsp (32g)', servingWeight: 32, calories: 196, protein: 6.8, carbs: 6, fat: 18, fiber: 3.3, sugar: 2.3, sodium: 2 },

  // SNACKS
  { id: 's001', name: 'Protein Bar', category: 'snacks', servingSize: '1 bar (60g)', servingWeight: 60, calories: 230, protein: 20, carbs: 25, fat: 8, fiber: 3, sugar: 6, sodium: 200 },
  { id: 's002', name: 'Dark Chocolate (70%)', category: 'snacks', servingSize: '1 oz (28g)', servingWeight: 28, calories: 170, protein: 2.2, carbs: 13, fat: 12, fiber: 3.1, sugar: 7, sodium: 6 },
  { id: 's003', name: 'Rice Cakes', category: 'snacks', servingSize: '2 cakes (18g)', servingWeight: 18, calories: 70, protein: 1.4, carbs: 15, fat: 0.5, fiber: 0.4, sugar: 0, sodium: 29 },
  { id: 's004', name: 'Trail Mix', category: 'snacks', servingSize: '¼ cup (38g)', servingWeight: 38, calories: 173, protein: 5, carbs: 16, fat: 11, fiber: 2, sugar: 9, sodium: 48 },
  { id: 's005', name: 'Potato Chips', category: 'snacks', servingSize: '1 oz (28g)', servingWeight: 28, calories: 152, protein: 2, carbs: 15, fat: 10, fiber: 1.2, sugar: 0.1, sodium: 148 },
  { id: 's006', name: 'Popcorn (Air-popped)', category: 'snacks', servingSize: '3 cups (24g)', servingWeight: 24, calories: 93, protein: 3, carbs: 19, fat: 1.1, fiber: 3.5, sugar: 0.2, sodium: 1 },
  { id: 's007', name: 'Hummus', category: 'snacks', servingSize: '2 tbsp (30g)', servingWeight: 30, calories: 70, protein: 2, carbs: 4, fat: 5, fiber: 1, sugar: 0.3, sodium: 130 },
  { id: 's008', name: 'Beef Jerky', category: 'snacks', servingSize: '1 oz (28g)', servingWeight: 28, calories: 116, protein: 9.4, carbs: 3.1, fat: 7.3, fiber: 0.5, sugar: 2.6, sodium: 506 },
  { id: 's009', name: 'Crackers (Whole Wheat)', category: 'snacks', servingSize: '5 crackers (16g)', servingWeight: 16, calories: 70, protein: 1, carbs: 11, fat: 2.5, fiber: 1, sugar: 0.5, sodium: 115 },
  { id: 's010', name: 'Dried Mango', category: 'snacks', servingSize: '¼ cup (40g)', servingWeight: 40, calories: 128, protein: 0.8, carbs: 31, fat: 0.5, fiber: 1.2, sugar: 27, sodium: 24 },

  // DRINKS
  { id: 'dr001', name: 'Orange Juice', category: 'drinks', servingSize: '1 cup (248ml)', servingWeight: 248, calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, sugar: 21, sodium: 2 },
  { id: 'dr002', name: 'Coca-Cola', category: 'drinks', servingSize: '1 can (355ml)', servingWeight: 355, calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, sugar: 39, sodium: 45 },
  { id: 'dr003', name: 'Coffee (Black)', category: 'drinks', servingSize: '1 cup (237ml)', servingWeight: 237, calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 5 },
  { id: 'dr004', name: 'Coffee with Cream & Sugar', category: 'drinks', servingSize: '1 cup', servingWeight: 250, calories: 80, protein: 1, carbs: 10, fat: 4, fiber: 0, sugar: 10, sodium: 20 },
  { id: 'dr005', name: 'Green Tea', category: 'drinks', servingSize: '1 cup (237ml)', servingWeight: 237, calories: 2, protein: 0.5, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 2 },
  { id: 'dr006', name: 'Smoothie (Fruit)', category: 'drinks', servingSize: '1 cup (250ml)', servingWeight: 250, calories: 150, protein: 2, carbs: 35, fat: 0.5, fiber: 2, sugar: 28, sodium: 15 },
  { id: 'dr007', name: 'Protein Smoothie', category: 'drinks', servingSize: '16oz (473ml)', servingWeight: 473, calories: 280, protein: 30, carbs: 30, fat: 5, fiber: 3, sugar: 18, sodium: 180 },
  { id: 'dr008', name: 'Sports Drink (Gatorade)', category: 'drinks', servingSize: '20oz (591ml)', servingWeight: 591, calories: 140, protein: 0, carbs: 36, fat: 0, fiber: 0, sugar: 34, sodium: 270 },

  // FAST FOOD
  { id: 'ff001', name: 'Cheeseburger', category: 'fast_food', servingSize: '1 burger', servingWeight: 200, calories: 530, protein: 28, carbs: 40, fat: 28, fiber: 2, sugar: 9, sodium: 1050 },
  { id: 'ff002', name: 'French Fries (Medium)', category: 'fast_food', servingSize: '1 serving (117g)', servingWeight: 117, calories: 365, protein: 4, carbs: 44, fat: 19, fiber: 4, sugar: 0.3, sodium: 246 },
  { id: 'ff003', name: 'Chicken Nuggets (6pc)', category: 'fast_food', servingSize: '6 pieces (96g)', servingWeight: 96, calories: 280, protein: 14, carbs: 17, fat: 17, fiber: 1, sugar: 0, sodium: 540 },
  { id: 'ff004', name: 'Pizza Slice (Cheese)', category: 'fast_food', servingSize: '1 large slice (107g)', servingWeight: 107, calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2.5, sugar: 3.6, sodium: 640 },
  { id: 'ff005', name: 'Subway Turkey Sub (6")', category: 'fast_food', servingSize: '1 sub (220g)', servingWeight: 220, calories: 280, protein: 18, carbs: 46, fat: 3.5, fiber: 5, sugar: 7, sodium: 810 },
  { id: 'ff006', name: 'Fried Chicken (1 piece)', category: 'fast_food', servingSize: '1 breast (140g)', servingWeight: 140, calories: 390, protein: 33, carbs: 12, fat: 23, fiber: 0.5, sugar: 0, sodium: 1190 },
  { id: 'ff007', name: 'Hot Dog', category: 'fast_food', servingSize: '1 with bun', servingWeight: 115, calories: 290, protein: 10, carbs: 24, fat: 17, fiber: 1, sugar: 4, sodium: 810 },
  { id: 'ff008', name: 'Burrito (Chicken)', category: 'fast_food', servingSize: '1 burrito (300g)', servingWeight: 300, calories: 580, protein: 32, carbs: 60, fat: 22, fiber: 8, sugar: 3, sodium: 1280 },
  { id: 'ff009', name: 'Fish & Chips', category: 'fast_food', servingSize: '1 serving', servingWeight: 350, calories: 640, protein: 28, carbs: 60, fat: 32, fiber: 4, sugar: 2, sodium: 890 },
  { id: 'ff010', name: 'Taco (Beef)', category: 'fast_food', servingSize: '1 taco', servingWeight: 85, calories: 210, protein: 10, carbs: 15, fat: 12, fiber: 2, sugar: 1, sodium: 340 },

  // COMMON MEALS
  { id: 'm001', name: 'Spaghetti Bolognese', category: 'meals', servingSize: '1 plate (400g)', servingWeight: 400, calories: 520, protein: 25, carbs: 62, fat: 18, fiber: 5, sugar: 10, sodium: 720 },
  { id: 'm002', name: 'Chicken Caesar Salad', category: 'meals', servingSize: '1 bowl (300g)', servingWeight: 300, calories: 360, protein: 30, carbs: 15, fat: 20, fiber: 3, sugar: 3, sodium: 580 },
  { id: 'm003', name: 'Jollof Rice', category: 'meals', servingSize: '1 plate (350g)', servingWeight: 350, calories: 480, protein: 10, carbs: 70, fat: 18, fiber: 3, sugar: 6, sodium: 690 },
  { id: 'm004', name: 'Fried Rice (Chicken)', category: 'meals', servingSize: '1 plate (350g)', servingWeight: 350, calories: 510, protein: 22, carbs: 58, fat: 20, fiber: 3, sugar: 4, sodium: 880 },
  { id: 'm005', name: 'Grilled Chicken Salad', category: 'meals', servingSize: '1 bowl (300g)', servingWeight: 300, calories: 280, protein: 32, carbs: 12, fat: 12, fiber: 4, sugar: 5, sodium: 420 },
  { id: 'm006', name: 'Stir-Fry (Chicken & Veg)', category: 'meals', servingSize: '1 plate (300g)', servingWeight: 300, calories: 350, protein: 28, carbs: 25, fat: 15, fiber: 5, sugar: 8, sodium: 780 },
  { id: 'm007', name: 'Peanut Butter Sandwich', category: 'meals', servingSize: '1 sandwich', servingWeight: 100, calories: 376, protein: 14, carbs: 40, fat: 19, fiber: 4, sugar: 8, sodium: 400 },
  { id: 'm008', name: 'Scrambled Eggs with Toast', category: 'meals', servingSize: '2 eggs + 2 toast', servingWeight: 180, calories: 350, protein: 18, carbs: 28, fat: 18, fiber: 2, sugar: 4, sodium: 520 },
  { id: 'm009', name: 'Omelette (3 eggs, cheese)', category: 'meals', servingSize: '1 omelette', servingWeight: 200, calories: 390, protein: 26, carbs: 2, fat: 30, fiber: 0, sugar: 1, sodium: 540 },
  { id: 'm010', name: 'Pancakes (3 stack)', category: 'meals', servingSize: '3 pancakes', servingWeight: 180, calories: 420, protein: 10, carbs: 55, fat: 18, fiber: 2, sugar: 16, sodium: 580 },
  { id: 'm011', name: 'Chicken Wrap', category: 'meals', servingSize: '1 wrap', servingWeight: 250, calories: 380, protein: 28, carbs: 35, fat: 14, fiber: 3, sugar: 3, sodium: 720 },
  { id: 'm012', name: 'Beef Stir Fry with Rice', category: 'meals', servingSize: '1 plate (400g)', servingWeight: 400, calories: 550, protein: 30, carbs: 55, fat: 22, fiber: 4, sugar: 6, sodium: 850 },
  { id: 'm013', name: 'Vegetable Soup', category: 'meals', servingSize: '1 bowl (250ml)', servingWeight: 250, calories: 120, protein: 4, carbs: 18, fat: 3.5, fiber: 4, sugar: 6, sodium: 650 },
  { id: 'm014', name: 'Chicken Noodle Soup', category: 'meals', servingSize: '1 bowl (250ml)', servingWeight: 250, calories: 175, protein: 12, carbs: 20, fat: 5, fiber: 1, sugar: 2, sodium: 890 },

  // CONDIMENTS
  { id: 'c001', name: 'Olive Oil', category: 'condiments', servingSize: '1 tbsp (14ml)', servingWeight: 14, calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0 },
  { id: 'c002', name: 'Ketchup', category: 'condiments', servingSize: '1 tbsp (17g)', servingWeight: 17, calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0, sugar: 4, sodium: 154 },
  { id: 'c003', name: 'Mayonnaise', category: 'condiments', servingSize: '1 tbsp (15g)', servingWeight: 15, calories: 94, protein: 0.1, carbs: 0.1, fat: 10, fiber: 0, sugar: 0.1, sodium: 88 },
  { id: 'c004', name: 'Soy Sauce', category: 'condiments', servingSize: '1 tbsp (18ml)', servingWeight: 18, calories: 11, protein: 1, carbs: 1, fat: 0, fiber: 0, sugar: 0.4, sodium: 1006 },
  { id: 'c005', name: 'Honey', category: 'condiments', servingSize: '1 tbsp (21g)', servingWeight: 21, calories: 64, protein: 0.1, carbs: 17, fat: 0, fiber: 0, sugar: 17, sodium: 1 },
  { id: 'c006', name: 'Ranch Dressing', category: 'condiments', servingSize: '2 tbsp (30g)', servingWeight: 30, calories: 129, protein: 0.4, carbs: 2, fat: 13, fiber: 0, sugar: 1.4, sodium: 245 },
  { id: 'c007', name: 'Hot Sauce', category: 'condiments', servingSize: '1 tsp (5ml)', servingWeight: 5, calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 124 },
  { id: 'c008', name: 'Salsa', category: 'condiments', servingSize: '2 tbsp (32g)', servingWeight: 32, calories: 10, protein: 0.5, carbs: 2, fat: 0, fiber: 0.5, sugar: 1, sodium: 200 },

  // DESSERTS
  { id: 'de001', name: 'Ice Cream (Vanilla)', category: 'desserts', servingSize: '½ cup (66g)', servingWeight: 66, calories: 137, protein: 2.3, carbs: 16, fat: 7, fiber: 0.5, sugar: 14, sodium: 53 },
  { id: 'de002', name: 'Chocolate Cake', category: 'desserts', servingSize: '1 slice (95g)', servingWeight: 95, calories: 352, protein: 4.5, carbs: 50, fat: 15, fiber: 2, sugar: 36, sodium: 299 },
  { id: 'de003', name: 'Cookies (Chocolate Chip)', category: 'desserts', servingSize: '2 cookies (30g)', servingWeight: 30, calories: 140, protein: 1.5, carbs: 19, fat: 7, fiber: 0.5, sugar: 11, sodium: 95 },
  { id: 'de004', name: 'Brownie', category: 'desserts', servingSize: '1 piece (56g)', servingWeight: 56, calories: 227, protein: 3, carbs: 36, fat: 9, fiber: 1.2, sugar: 21, sodium: 175 },
  { id: 'de005', name: 'Frozen Yogurt', category: 'desserts', servingSize: '½ cup (72g)', servingWeight: 72, calories: 110, protein: 3, carbs: 21, fat: 1.5, fiber: 0, sugar: 17, sodium: 60 },
  { id: 'de006', name: 'Donut (Glazed)', category: 'desserts', servingSize: '1 donut (60g)', servingWeight: 60, calories: 269, protein: 3.2, carbs: 31, fat: 15, fiber: 0.7, sugar: 15, sodium: 257 },
];