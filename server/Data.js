

const pizzaPacks = [
  // --- CLASSIC (10) ---
  {
    name: "Classic Margherita",
    description: "The Italian standard: San Marzano sauce, fresh mozzarella, basil, and EVOO.",
    category: "CLASSIC",
    price: 14.99,
    isFeatured: true,
    image: { url: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38", credit: "@viniciusbenedit" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "San Marzano Tomato", qty: 80 },
      cheeses: [{ name: "Fresh Mozzarella", qty: 100 }],
      toppings: [{ name: "Fresh Basil", qty: 5 }, { name: "Extra Virgin Olive Oil", qty: 10 }]
    }
  },
  {
    name: "Double Pepperoni",
    description: "Loaded with two layers of crispy, spicy pepperoni and aged mozzarella.",
    category: "CLASSIC",
    price: 16.99,
    image: { url: "https://images.unsplash.com/photo-1628840042765-356cda07504e", credit: "@shane_rounce" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Herb Tomato Sauce", qty: 90 },
      cheeses: [{ name: "Mozzarella", qty: 120 }],
      toppings: [{ name: "Pepperoni", qty: 40 }]
    }
  },
  {
    name: "The Marinara",
    description: "Simple and vegan: Tomato sauce, garlic, oregano, and olive oil. No cheese.",
    category: "CLASSIC",
    price: 12.99,
    image: { url: "https://images.unsplash.com/photo-1594007654729-407eedc4be65", credit: "@m_pizzas" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "Garlic Tomato Blend", qty: 100 },
      cheeses: [],
      toppings: [{ name: "Sliced Garlic", qty: 15 }, { name: "Oregano", qty: 2 }]
    }
  },
  {
    name: "New York Cheese",
    description: "A foldable classic with a rich blend of Mozzarella, Provolone, and Parmesan.",
    category: "CLASSIC",
    price: 13.99,
    image: { url: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c", credit: "@iv_pizzas" },
    ingredientsSnapshot: {
      base: { name: "NY Style Dough", qty: 300 },
      sauce: { name: "Classic Pizza Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }, { name: "Provolone", qty: 30 }, { name: "Parmesan", qty: 20 }],
      toppings: []
    }
  },
  {
    name: "The Hawaiian",
    description: "Controversial but delicious: Smoked ham and sweet pineapple chunks.",
    category: "CLASSIC",
    price: 15.99,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@briewilly" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Classic Pizza Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 110 }],
      toppings: [{ name: "Smoked Ham", qty: 50 }, { name: "Pineapple Chunks", qty: 60 }]
    }
  },
  {
    name: "Supreme Classic",
    description: "Pepperoni, sausage, green peppers, onions, and mushrooms.",
    category: "CLASSIC",
    price: 18.99,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@i_pizzas" },
    ingredientsSnapshot: {
      base: { name: "Deep Dish Dough", qty: 350 },
      sauce: { name: "Chunky Tomato Sauce", qty: 100 },
      cheeses: [{ name: "Mozzarella", qty: 130 }],
      toppings: [{ name: "Pepperoni", qty: 20 }, { name: "Italian Sausage", qty: 30 }, { name: "Bell Peppers", qty: 20 }, { name: "Red Onion", qty: 15 }]
    }
  },
  {
    name: "Quattro Formaggi",
    description: "A cheese lover's dream: Mozzarella, Gorgonzola, Fontina, and Parmesan.",
    category: "CLASSIC",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1573821663912-5699037ea012", credit: "@food_photog" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Classic Pizza Sauce", qty: 60 },
      cheeses: [{ name: "Mozzarella", qty: 60 }, { name: "Gorgonzola", qty: 30 }, { name: "Fontina", qty: 30 }, { name: "Parmesan", qty: 20 }],
      toppings: []
    }
  },
  {
    name: "Napolitana Special",
    description: "Anchovies, capers, and olives on a crispy base.",
    category: "CLASSIC",
    price: 15.99,
    image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@fish_pizza" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "San Marzano Tomato", qty: 80 },
      cheeses: [{ name: "Fresh Mozzarella", qty: 80 }],
      toppings: [{ name: "Anchovies", qty: 20 }, { name: "Capers", qty: 10 }, { name: "Black Olives", qty: 15 }]
    }
  },
  {
    name: "Capricciosa",
    description: "Artichokes, mushrooms, ham, and olives.",
    category: "CLASSIC",
    price: 17.99,
    image: { url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d", credit: "@foodie" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Artichoke Hearts", qty: 40 }, { name: "Mushrooms", qty: 30 }, { name: "Ham", qty: 30 }]
    }
  },
  {
    name: "Classic Sausage",
    description: "Simple, savory Italian sausage on a bed of melted mozzarella.",
    category: "CLASSIC",
    price: 14.99,
    image: { url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c", credit: "@meat_lover" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 110 }],
      toppings: [{ name: "Italian Sausage", qty: 60 }]
    }
  },

  // --- VEG (10) ---
  {
    name: "Garden Delight",
    description: "Fresh spinach, bell peppers, onions, and sun-dried tomatoes.",
    category: "VEG",
    price: 15.50,
    image: { url: "https://images.unsplash.com/photo-1520201163981-8cc95007dd2a", credit: "@garden_lover" },
    ingredientsSnapshot: {
      base: { name: "Whole Wheat Dough", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Spinach", qty: 30 }, { name: "Bell Peppers", qty: 30 }, { name: "Sun-dried Tomatoes", qty: 20 }]
    }
  },
  {
    name: "Wild Mushroom & Truffle",
    description: "A mix of Shiitake, Oyster, and Button mushrooms with a hint of truffle oil.",
    category: "VEG",
    price: 18.99,
    image: { url: "https://images.unsplash.com/photo-1555072956-7758afb20e8f", credit: "@mushroom_man" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "White Bechamel Sauce", qty: 70 },
      cheeses: [{ name: "Mozzarella", qty: 90 }, { name: "Pecorino", qty: 20 }],
      toppings: [{ name: "Mushroom Medley", qty: 80 }, { name: "Truffle Oil", qty: 5 }]
    }
  },
  {
    name: "Mediterranean Veggie",
    description: "Feta cheese, kalamata olives, artichokes, and roasted red peppers.",
    category: "VEG",
    price: 16.99,
    image: { url: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47", credit: "@greek_chef" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Hummus Base", qty: 60 },
      cheeses: [{ name: "Feta", qty: 50 }, { name: "Mozzarella", qty: 60 }],
      toppings: [{ name: "Kalamata Olives", qty: 30 }, { name: "Artichokes", qty: 30 }]
    }
  },
  {
    name: "Pesto Primavera",
    description: "Basil pesto base with zucchini, cherry tomatoes, and pine nuts.",
    category: "VEG",
    price: 16.50,
    image: { url: "https://images.unsplash.com/photo-1593504049359-74330189a345", credit: "@pesto_fan" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Basil Pesto", qty: 60 },
      cheeses: [{ name: "Parmesan", qty: 40 }],
      toppings: [{ name: "Zucchini", qty: 40 }, { name: "Cherry Tomatoes", qty: 30 }, { name: "Pine Nuts", qty: 10 }]
    }
  },
  {
    name: "Roasted Garlic & Spinach",
    description: "Sweet roasted garlic cloves with fresh baby spinach and ricotta.",
    category: "VEG",
    price: 15.99,
    image: { url: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a", credit: "@garlic_king" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Garlic Oil Base", qty: 40 },
      cheeses: [{ name: "Ricotta", qty: 60 }, { name: "Mozzarella", qty: 80 }],
      toppings: [{ name: "Roasted Garlic", qty: 20 }, { name: "Spinach", qty: 40 }]
    }
  },
  {
    name: "The Greek Garden",
    description: "Fresh cucumbers (post-bake), tomatoes, olives, onions, and tzatziki drizzle.",
    category: "VEG",
    price: 14.99,
    image: { url: "https://images.unsplash.com/photo-1627464146500-2d5cc5992839", credit: "@tzatziki_love" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 70 },
      cheeses: [{ name: "Feta", qty: 60 }],
      toppings: [{ name: "Red Onion", qty: 20 }, { name: "Olives", qty: 20 }, { name: "Cherry Tomatoes", qty: 30 }]
    }
  },
  {
    name: "Veggie Firehouse",
    description: "Jalapeños, banana peppers, spicy tofu, and sriracha swirl.",
    category: "VEG",
    price: 16.00,
    image: { url: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9", credit: "@spicy_veg" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Spicy Tomato", qty: 80 },
      cheeses: [{ name: "Pepper Jack", qty: 100 }],
      toppings: [{ name: "Jalapeños", qty: 20 }, { name: "Spicy Tofu", qty: 40 }]
    }
  },
  {
    name: "Eggplant Parm Pizza",
    description: "Crispy breaded eggplant, marinara, and extra parmesan.",
    category: "VEG",
    price: 16.50,
    image: { url: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5", credit: "@eggplant_parm" },
    ingredientsSnapshot: {
      base: { name: "NY Dough", qty: 300 },
      sauce: { name: "Marinara", qty: 100 },
      cheeses: [{ name: "Mozzarella", qty: 90 }, { name: "Parmesan", qty: 40 }],
      toppings: [{ name: "Fried Eggplant", qty: 60 }]
    }
  },
  {
    name: "Sweet Corn & Jalapeño",
    description: "Street corn style with cotija cheese, lime, and cilantro.",
    category: "VEG",
    price: 15.50,
    image: { url: "https://images.unsplash.com/photo-1544982503-9f984c14501a", credit: "@corn_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Chipotle Mayo Base", qty: 50 },
      cheeses: [{ name: "Mozzarella", qty: 80 }, { name: "Cotija", qty: 30 }],
      toppings: [{ name: "Sweet Corn", qty: 50 }, { name: "Jalapeños", qty: 15 }]
    }
  },
  {
    name: "Buffalo Cauliflower",
    description: "Roasted cauliflower tossed in buffalo sauce with celery and blue cheese.",
    category: "VEG",
    price: 16.99,
    image: { url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c", credit: "@cauli_buff" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Buffalo Sauce", qty: 70 },
      cheeses: [{ name: "Mozzarella", qty: 90 }, { name: "Blue Cheese", qty: 30 }],
      toppings: [{ name: "Roasted Cauliflower", qty: 70 }, { name: "Celery Bits", qty: 10 }]
    }
  },

  // --- NON_VEG (10) ---
  {
    name: "BBQ Chicken Smash",
    description: "Tangy BBQ sauce, grilled chicken, red onions, and fresh cilantro.",
    category: "NON_VEG",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@bbq_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "BBQ Sauce", qty: 80 },
      cheeses: [{ name: "Cheddar-Jack", qty: 110 }],
      toppings: [{ name: "Grilled Chicken", qty: 70 }, { name: "Red Onion", qty: 20 }, { name: "Cilantro", qty: 5 }]
    }
  },
  {
    name: "The Meat Mountain",
    description: "Bacon, sausage, pepperoni, ham, and ground beef.",
    category: "NON_VEG",
    price: 19.99,
    image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@meat_heavy" },
    ingredientsSnapshot: {
      base: { name: "Pan Pizza Dough", qty: 350 },
      sauce: { name: "Classic Tomato", qty: 100 },
      cheeses: [{ name: "Mozzarella", qty: 150 }],
      toppings: [{ name: "Bacon Bits", qty: 30 }, { name: "Sausage", qty: 30 }, { name: "Pepperoni", qty: 20 }, { name: "Ham", qty: 30 }, { name: "Beef", qty: 30 }]
    }
  },
  {
    name: "Prosciutto & Arugula",
    description: "White pizza topped with salty prosciutto and fresh peppery arugula.",
    category: "NON_VEG",
    price: 18.50,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@prosciutto_fan" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "Garlic Butter", qty: 40 },
      cheeses: [{ name: "Fresh Mozzarella", qty: 100 }],
      toppings: [{ name: "Prosciutto Di Parma", qty: 40 }, { name: "Arugula", qty: 20 }, { name: "Shaved Parmesan", qty: 15 }]
    }
  },
  {
    name: "Chicken Bacon Ranch",
    description: "Creamy ranch base with crispy chicken and smoky bacon.",
    category: "NON_VEG",
    price: 17.99,
    image: { url: "https://images.unsplash.com/photo-1594007654729-407eedc4be65", credit: "@ranch_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Ranch Dressing", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 110 }],
      toppings: [{ name: "Crispy Chicken", qty: 60 }, { name: "Bacon Strips", qty: 40 }]
    }
  },
  {
    name: "Steak & Blue Cheese",
    description: "Thinly sliced ribeye, caramelized onions, and blue cheese crumbles.",
    category: "NON_VEG",
    price: 19.50,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@steak_pizza" },
    ingredientsSnapshot: {
      base: { name: "NY Style Dough", qty: 300 },
      sauce: { name: "A1 Base", qty: 40 },
      cheeses: [{ name: "Mozzarella", qty: 90 }, { name: "Blue Cheese", qty: 30 }],
      toppings: [{ name: "Ribeye Steak", qty: 80 }, { name: "Caramelized Onions", qty: 40 }]
    }
  },
  {
    name: "Buffalo Chicken Blast",
    description: "Spicy buffalo chicken, blue cheese, and a buffalo sauce swirl.",
    category: "NON_VEG",
    price: 16.99,
    image: { url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c", credit: "@buffalo_chicken" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Buffalo Base", qty: 70 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Buffalo Chicken", qty: 70 }, { name: "Green Onions", qty: 10 }]
    }
  },
  {
    name: "The Carbonara",
    description: "Egg-based sauce, pecorino, pancetta, and lots of black pepper.",
    category: "NON_VEG",
    price: 18.99,
    image: { url: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38", credit: "@carbonara_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Cream & Egg Base", qty: 60 },
      cheeses: [{ name: "Pecorino Romano", qty: 50 }, { name: "Mozzarella", qty: 50 }],
      toppings: [{ name: "Pancetta", qty: 50 }, { name: "Black Pepper", qty: 5 }]
    }
  },
  {
    name: "Sweet & Spicy Sausage",
    description: "Honey-drizzled spicy sausage and red chili flakes.",
    category: "NON_VEG",
    price: 16.50,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@honey_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Spicy Italian Sausage", qty: 60 }, { name: "Hot Honey", qty: 15 }]
    }
  },
  {
    name: "Philly Cheesesteak Pizza",
    description: "Steak, peppers, onions, and cheese sauce.",
    category: "NON_VEG",
    price: 18.99,
    image: { url: "https://images.unsplash.com/photo-1628840042765-356cda07504e", credit: "@philly_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Cheese Sauce", qty: 90 },
      cheeses: [{ name: "Provolone", qty: 100 }],
      toppings: [{ name: "Beef Strips", qty: 70 }, { name: "Peppers & Onions", qty: 50 }]
    }
  },
  {
    name: "Taco Fiesta Pizza",
    description: "Ground beef, salsa, lettuce, tomato, and corn chips.",
    category: "NON_VEG",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@taco_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Salsa Base", qty: 80 },
      cheeses: [{ name: "Mexican Blend", qty: 120 }],
      toppings: [{ name: "Seasoned Beef", qty: 60 }, { name: "Tortilla Strips", qty: 20 }]
    }
  },

  // --- SPICY (10) ---
  {
    name: "Jalapeño Popper",
    description: "Cream cheese, fresh jalapeños, bacon, and cheddar.",
    category: "SPICY",
    price: 17.00,
    image: { url: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9", credit: "@popper_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Cream Cheese Base", qty: 60 },
      cheeses: [{ name: "Cheddar", qty: 100 }],
      toppings: [{ name: "Jalapeños", qty: 40 }, { name: "Crispy Bacon", qty: 30 }]
    }
  },
  {
    name: "The Inferno",
    description: "Habanero oil, spicy salami, red chili, and ghost pepper jack.",
    category: "SPICY",
    price: 18.99,
    image: { url: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38", credit: "@inferno_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Spicy Arrabbiata", qty: 80 },
      cheeses: [{ name: "Ghost Pepper Jack", qty: 100 }],
      toppings: [{ name: "Spicy Salami", qty: 40 }, { name: "Fresh Habanero", qty: 10 }]
    }
  },
  {
    name: "Diavola",
    description: "Traditional spicy Italian salami with crushed red pepper and olives.",
    category: "SPICY",
    price: 16.50,
    image: { url: "https://images.unsplash.com/photo-1628840042765-356cda07504e", credit: "@diavola" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Fresh Mozzarella", qty: 90 }],
      toppings: [{ name: "Salami Picante", qty: 50 }, { name: "Chili Flakes", qty: 5 }]
    }
  },
  {
    name: "Angry Buffalo Chicken",
    description: "Extreme heat buffalo sauce, chicken, and extra jalapeños.",
    category: "SPICY",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c", credit: "@angry_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Insanity Buffalo Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Spicy Chicken", qty: 70 }, { name: "Jalapeños", qty: 30 }]
    }
  },
  {
    name: "Korean Gochujang Pork",
    description: "Spicy marinated pork, kimchi, and gochujang mayo drizzle.",
    category: "SPICY",
    price: 18.50,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@korean_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Gochujang Base", qty: 60 },
      cheeses: [{ name: "Mozzarella", qty: 80 }],
      toppings: [{ name: "Spicy Pork", qty: 70 }, { name: "Kimchi", qty: 40 }]
    }
  },
  {
    name: "Chili Honey Pepperoni",
    description: "Double pepperoni with double the chili flakes and hot honey.",
    category: "SPICY",
    price: 17.99,
    image: { url: "https://images.unsplash.com/photo-1628840042765-356cda07504e", credit: "@honey_spicy" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Spicy Tomato", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Pepperoni", qty: 50 }, { name: "Hot Honey", qty: 20 }]
    }
  },
  {
    name: "Mexican Street Heat",
    description: "Chorizo, jalapeño, onion, and salsa verde swirl.",
    category: "SPICY",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@mex_heat" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Spicy Bean Base", qty: 70 },
      cheeses: [{ name: "Monterey Jack", qty: 100 }],
      toppings: [{ name: "Chorizo", qty: 60 }, { name: "Jalapeños", qty: 20 }]
    }
  },
  {
    name: "Thai Sweet Chili Chicken",
    description: "Sweet chili base, chicken, red peppers, and bird's eye chilies.",
    category: "SPICY",
    price: 18.00,
    image: { url: "https://images.unsplash.com/photo-1594007654729-407eedc4be65", credit: "@thai_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Sweet Chili Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 80 }],
      toppings: [{ name: "Chicken", qty: 60 }, { name: "Bird's Eye Chili", qty: 5 }]
    }
  },
  {
    name: "Wasabi Steak",
    description: "Beef strips with a powerful wasabi-infused cream sauce.",
    category: "SPICY",
    price: 20.00,
    image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@wasabi_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Wasabi Cream", qty: 60 },
      cheeses: [{ name: "Mozzarella", qty: 80 }],
      toppings: [{ name: "Seared Beef", qty: 70 }]
    }
  },
  {
    name: "Sriracha Sausage Blast",
    description: "Sausage, peppers, and onions smothered in sriracha sauce.",
    category: "SPICY",
    price: 17.50,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@sriracha_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Tomato Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 100 }],
      toppings: [{ name: "Sausage", qty: 60 }, { name: "Sriracha", qty: 25 }]
    }
  },

  // --- PREMIUM (10) ---
  {
    name: "The Black Truffle",
    description: "Shaved black truffles, porcini mushrooms, and fontina cheese.",
    category: "PREMIUM",
    price: 24.99,
    isFeatured: true,
    image: { url: "https://images.unsplash.com/photo-1555072956-7758afb20e8f", credit: "@truffle_pizza" },
    ingredientsSnapshot: {
      base: { name: "Artisan Sourdough", qty: 250 },
      sauce: { name: "Truffle Cream", qty: 70 },
      cheeses: [{ name: "Fontina", qty: 100 }, { name: "Parmigiano Reggiano", qty: 30 }],
      toppings: [{ name: "Black Truffle Shavings", qty: 10 }, { name: "Porcini", qty: 40 }]
    }
  },
  {
    name: "Lobster Thermidor Pizza",
    description: "Poached lobster tail, brandy cream sauce, and gruyère.",
    category: "PREMIUM",
    price: 29.99,
    image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@lobster_pizza" },
    ingredientsSnapshot: {
      base: { name: "Butter Crust", qty: 250 },
      sauce: { name: "Lobster Bisque Sauce", qty: 80 },
      cheeses: [{ name: "Gruyère", qty: 100 }],
      toppings: [{ name: "Lobster Meat", qty: 80 }, { name: "Chives", qty: 5 }]
    }
  },
  {
    name: "Wagyu & Gold",
    description: "A5 Wagyu beef strips, balsamic reduction, and edible gold leaf.",
    category: "PREMIUM",
    price: 45.00,
    image: { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", credit: "@wagyu_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Artisan Crust", qty: 220 },
      sauce: { name: "Bone Marrow Butter", qty: 50 },
      cheeses: [{ name: "Smoked Gouda", qty: 80 }],
      toppings: [{ name: "Wagyu Beef", qty: 100 }, { name: "Edible Gold", qty: 1 }]
    }
  },
  {
    name: "Burrata & Fig",
    description: "Creamy whole burrata, fresh figs, and prosciutto di parma.",
    category: "PREMIUM",
    price: 22.50,
    image: { url: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38", credit: "@burrata_pizza" },
    ingredientsSnapshot: {
      base: { name: "Neapolitan Dough", qty: 250 },
      sauce: { name: "Honey Glaze Base", qty: 30 },
      cheeses: [{ name: "Burrata Cheese", qty: 125 }],
      toppings: [{ name: "Fresh Figs", qty: 50 }, { name: "Prosciutto", qty: 40 }]
    }
  },
  {
    name: "Smoked Salmon & Caviar",
    description: "Cold-smoked salmon, crème fraîche, capers, and premium caviar.",
    category: "PREMIUM",
    price: 32.00,
    image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@salmon_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Crème Fraîche", qty: 60 },
      cheeses: [],
      toppings: [{ name: "Smoked Salmon", qty: 80 }, { name: "Caviar", qty: 10 }, { name: "Dill", qty: 5 }]
    }
  },
  {
    name: "The Duck Confit",
    description: "Shredded duck leg, hoisin glaze, scallions, and cucumber.",
    category: "PREMIUM",
    price: 26.00,
    image: { url: "https://images.unsplash.com/photo-1594007654729-407eedc4be65", credit: "@duck_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Hoisin Base", qty: 50 },
      cheeses: [{ name: "Mozzarella", qty: 60 }],
      toppings: [{ name: "Duck Confit", qty: 80 }, { name: "Scallions", qty: 15 }]
    }
  },
  {
    name: "Wild Boar & Apple",
    description: "Savory wild boar sausage, crisp apple slices, and sage.",
    category: "PREMIUM",
    price: 23.50,
    image: { url: "https://images.unsplash.com/photo-1628840042765-356cda07504e", credit: "@boar_pizza" },
    ingredientsSnapshot: {
      base: { name: "Artisan Crust", qty: 250 },
      sauce: { name: "Apple Butter Base", qty: 40 },
      cheeses: [{ name: "Aged White Cheddar", qty: 90 }],
      toppings: [{ name: "Wild Boar Sausage", qty: 70 }, { name: "Green Apple", qty: 30 }]
    }
  },
  {
    name: "Garlic Butter Prawn",
    description: "Jumbo king prawns, garlic butter, and fresh parsley.",
    category: "PREMIUM",
    price: 25.00,
    image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@prawn_pizza" },
    ingredientsSnapshot: {
      base: { name: "Standard Crust", qty: 250 },
      sauce: { name: "Garlic Butter Sauce", qty: 80 },
      cheeses: [{ name: "Mozzarella", qty: 80 }],
      toppings: [{ name: "King Prawns", qty: 100 }, { name: "Parsley", qty: 5 }]
    }
  },
  {
    name: "Chèvre & Roasted Beet",
    description: "Goat cheese, balsamic roasted beets, and toasted walnuts.",
    category: "PREMIUM",
    price: 21.00,
    image: { url: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a", credit: "@beet_pizza" },
    ingredientsSnapshot: {
      base: { name: "Thin Crust", qty: 220 },
      sauce: { name: "Olive Oil Base", qty: 40 },
      cheeses: [{ name: "Goat Cheese", qty: 80 }],
      toppings: [{ name: "Roasted Beets", qty: 60 }, { name: "Walnuts", qty: 20 }]
    }
  },
  {
    name: "Prime Rib & Horseradish",
    description: "Slow-roasted prime rib with a horseradish cream and au jus drizzle.",
    category: "PREMIUM",
    price: 28.00,
    image: { url: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c", credit: "@primerib_pizza" },
    ingredientsSnapshot: {
      base: { name: "Pan Dough", qty: 300 },
      sauce: { name: "Horseradish Cream", qty: 60 },
      cheeses: [{ name: "Swiss Cheese", qty: 90 }],
      toppings: [{ name: "Prime Rib Slices", qty: 90 }, { name: "Crispy Onions", qty: 20 }]
    }
  }
];




// NOTE: To reach 50, you can duplicate these into variations (e.g. 'Large' vs 'Medium', 
// or Gluten Free versions) or slightly modify the toppings for 'Spicy Pepperoni', 
// 'White Veggie', 'Truffle Mushroom', etc.


const ingredients = [
  // --- CATEGORY: BASE (1-10) ---
  { name: "Neapolitan Dough Ball", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1585238342024-78d387f4a707", credit: "@nadineprimeau" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Gluten-Free Dough", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1604152135912-04a022e23696", credit: "@pizzaguy" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Whole Wheat Dough", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94", credit: "@breadmaker" }, inventory: { currentStock: 8000, minThreshold: 800 } },
  { name: "Charcoal Infused Dough", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@blackpizza" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Multigrain Dough", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff", credit: "@grainman" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Cauliflower Crust Base", category: "BASE", unitType: "COUNT", defaultQuantity: 1, pricePerUnit: 150, image: { url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d", credit: "@cauli" }, inventory: { currentStock: 200, minThreshold: 50 } },
  { name: "Sourdough Starter Base", category: "BASE", unitType: "GRAM", defaultQuantity: 250, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1589415445174-012d307e0bab", credit: "@sour" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Cornmeal Dusting", category: "BASE", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1586444248902-2f64eddf13cf", credit: "@corn" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Semolina Flour", category: "BASE", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1627207644206-a2040d60ecad", credit: "@flour" }, inventory: { currentStock: 15000, minThreshold: 2000 } },
  { name: "Deep Dish Pan Dough", category: "BASE", unitType: "GRAM", defaultQuantity: 400, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47", credit: "@pan" }, inventory: { currentStock: 5000, minThreshold: 500 } },

  // --- CATEGORY: SAUCE (11-25) ---
  { name: "San Marzano Tomato Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 80, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9", credit: "@sauce" }, inventory: { currentStock: 20000, minThreshold: 2000 } },
  { name: "Spicy Arrabbiata Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 80, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@spicy" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Basil Pesto", category: "SAUCE", unitType: "ML", defaultQuantity: 50, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3", credit: "@pesto" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "White Bechamel Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 70, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1544434520-25e982079075", credit: "@white" }, inventory: { currentStock: 8000, minThreshold: 800 } },
  { name: "Hickory BBQ Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1625938146369-adc833546318", credit: "@bbq" }, inventory: { currentStock: 7000, minThreshold: 700 } },
  { name: "Buffalo Wing Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1622509185966-0d199f7f4575", credit: "@buff" }, inventory: { currentStock: 6000, minThreshold: 600 } },
  { name: "Garlic Butter Base", category: "SAUCE", unitType: "ML", defaultQuantity: 40, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d", credit: "@garlic" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Truffle Cream Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 50, pricePerUnit: 8, image: { url: "https://images.unsplash.com/photo-1555072956-7758afb20e8f", credit: "@truff" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Chipotle Mayo", category: "SAUCE", unitType: "ML", defaultQuantity: 40, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1585325706539-773f32420958", credit: "@chip" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Hoisin Glaze", category: "SAUCE", unitType: "ML", defaultQuantity: 40, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1634863212871-334da839958c", credit: "@hois" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Sweet Chili Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 50, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1621350110300-3058a70c7931", credit: "@chili" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Hummus Base", category: "SAUCE", unitType: "ML", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1577906030551-5b916ef20703", credit: "@humm" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Salsa Verde", category: "SAUCE", unitType: "ML", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1548946522-4a313e8972a4", credit: "@verde" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Curry Base Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 70, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db", credit: "@curry" }, inventory: { currentStock: 2500, minThreshold: 250 } },
  { name: "Thai Peanut Sauce", category: "SAUCE", unitType: "ML", defaultQuantity: 50, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1512485600893-b08ec1d59b1d", credit: "@peanut" }, inventory: { currentStock: 2000, minThreshold: 200 } },

  // --- CATEGORY: CHEESE (26-45) ---
  { name: "Low-Moisture Mozzarella", category: "CHEESE", unitType: "GRAM", defaultQuantity: 100, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@mozz" }, inventory: { currentStock: 50000, minThreshold: 5000 } },
  { name: "Fresh Buffalo Mozzarella", category: "CHEESE", unitType: "GRAM", defaultQuantity: 80, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1559561853-08451507cbe7", credit: "@buffmozz" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Parmigiano Reggiano", category: "CHEESE", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1452195100486-9cc805987862", credit: "@parm" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Sharp Cheddar", category: "CHEESE", unitType: "GRAM", defaultQuantity: 80, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1618067424218-40f94c1a5822", credit: "@ched" }, inventory: { currentStock: 15000, minThreshold: 1500 } },
  { name: "Gorgonzola Blue", category: "CHEESE", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1452195100486-9cc805987862", credit: "@gorg" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Feta Cheese Crumbles", category: "CHEESE", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1559561853-08451507cbe7", credit: "@feta" }, inventory: { currentStock: 6000, minThreshold: 600 } },
  { name: "Ricotta Cheese", category: "CHEESE", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1559561853-08451507cbe7", credit: "@rico" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Pecorino Romano", category: "CHEESE", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1618067424218-40f94c1a5822", credit: "@peco" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Smoked Gouda", category: "CHEESE", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1618067424218-40f94c1a5822", credit: "@goud" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Provolone Slices", category: "CHEESE", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@prov" }, inventory: { currentStock: 7000, minThreshold: 700 } },
  { name: "Fontina Cheese", category: "CHEESE", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@font" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Mascarpone", category: "CHEESE", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1559561853-08451507cbe7", credit: "@masc" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Swiss Gruyere", category: "CHEESE", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 6, image: { url: "https://images.unsplash.com/photo-1618067424218-40f94c1a5822", credit: "@gruy" }, inventory: { currentStock: 2500, minThreshold: 250 } },
  { name: "Monterey Jack", category: "CHEESE", unitType: "GRAM", defaultQuantity: 70, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@jack" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Vegan Mozzarella", category: "CHEESE", unitType: "GRAM", defaultQuantity: 100, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@vegmozz" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Brie Cheese Slices", category: "CHEESE", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@brie" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Burrata Whole", category: "CHEESE", unitType: "COUNT", defaultQuantity: 1, pricePerUnit: 250, image: { url: "https://images.unsplash.com/photo-1559561853-08451507cbe7", credit: "@burr" }, inventory: { currentStock: 100, minThreshold: 20 } },
  { name: "Pepper Jack", category: "CHEESE", unitType: "GRAM", defaultQuantity: 70, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1618067424218-40f94c1a5822", credit: "@pjack" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Taleggio Cheese", category: "CHEESE", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@tale" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Scamorza (Smoked Mozzarella)", category: "CHEESE", unitType: "GRAM", defaultQuantity: 80, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1552767059-ce182ead6c1b", credit: "@scam" }, inventory: { currentStock: 3000, minThreshold: 300 } },

  // --- CATEGORY: VEG_TOPPING (46-75) ---
  { name: "Sliced Button Mushrooms", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1519623286359-e9f3cbef015b", credit: "@mush" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Green Bell Peppers", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1566130096135-2bc38ac60773", credit: "@gbell" }, inventory: { currentStock: 8000, minThreshold: 800 } },
  { name: "Red Onions", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1508747703725-719777637510", credit: "@onion" }, inventory: { currentStock: 15000, minThreshold: 1500 } },
  { name: "Kalamata Olives", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 25, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1533152670737-14e365851493", credit: "@olive" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Pickled Jalapeños", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@jalap" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Baby Spinach", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb", credit: "@spin" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Sun-dried Tomatoes", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@sunt" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Artichoke Hearts", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@arti" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Sweet Corn", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076", credit: "@corn" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Roasted Garlic Cloves", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383", credit: "@garlic" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Cherry Tomatoes", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@cherry" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Pineapple Chunks", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1550258114-68bd2950ec91", credit: "@pine" }, inventory: { currentStock: 6000, minThreshold: 600 } },
  { name: "Zucchini Ribbons", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@zucc" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Black Beans", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1551462147-37885abb3e4a", credit: "@bean" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Red Chili Slices", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 10, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@rchili" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Broccoli Florets", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c", credit: "@brocc" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Banana Peppers", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@banp" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Capers", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 10, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@cap" }, inventory: { currentStock: 1000, minThreshold: 100 } },
  { name: "Roasted Red Peppers", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@rrp" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Shredded Carrots", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@carr" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Shitake Mushrooms", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1519623286359-e9f3cbef015b", credit: "@shit" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Oyster Mushrooms", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1519623286359-e9f3cbef015b", credit: "@oyst" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Green Olives", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 25, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1533152670737-14e365851493", credit: "@golive" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Arugula (Rocket)", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb", credit: "@arug" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Avocado Slices", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578", credit: "@avoc" }, inventory: { currentStock: 1000, minThreshold: 100 } },
  { name: "Caramelized Onions", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1508747703725-719777637510", credit: "@conion" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Eggplant Slices", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@egg" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Fresh Basil Leaves", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 10, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb", credit: "@fbas" }, inventory: { currentStock: 1000, minThreshold: 100 } },
  { name: "Pickles Sliced", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 20, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@pick" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Sweet Potato Slices", category: "VEG_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@swpo" }, inventory: { currentStock: 2000, minThreshold: 200 } },

  // --- CATEGORY: MEAT_TOPPING (76-95) ---
  { name: "Premium Pepperoni", category: "MEAT_TOPPING", unitType: "COUNT", defaultQuantity: 15, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1620371330940-2720ea403408", credit: "@pepp" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Italian Sausage Crumble", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@saus" }, inventory: { currentStock: 8000, minThreshold: 800 } },
  { name: "Smoked Bacon Bits", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1606851682841-a88b39417d3d", credit: "@bac" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Grilled Chicken Strips", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 70, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d", credit: "@chic" }, inventory: { currentStock: 10000, minThreshold: 1000 } },
  { name: "Spicy Salami Slices", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1620371330940-2720ea403408", credit: "@sala" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Ground Beef", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db", credit: "@beef" }, inventory: { currentStock: 8000, minThreshold: 800 } },
  { name: "Prosciutto Di Parma", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 30, pricePerUnit: 10, image: { url: "https://images.unsplash.com/photo-1513104890138-7c749659a591", credit: "@pros" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Pancetta Cubes", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1606851682841-a88b39417d3d", credit: "@panc" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Smoked Ham Slices", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1606851682841-a88b39417d3d", credit: "@ham" }, inventory: { currentStock: 6000, minThreshold: 600 } },
  { name: "Spicy Chorizo", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@chor" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Anchovy Fillets", category: "MEAT_TOPPING", unitType: "COUNT", defaultQuantity: 6, pricePerUnit: 15, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@anch" }, inventory: { currentStock: 500, minThreshold: 50 } },
  { name: "Meatballs Halved", category: "MEAT_TOPPING", unitType: "COUNT", defaultQuantity: 8, pricePerUnit: 10, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@ball" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Steak Strips (Ribeye)", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 8, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@stak" }, inventory: { currentStock: 3000, minThreshold: 300 } },
  { name: "Pulled Pork", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 70, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@pork" }, inventory: { currentStock: 4000, minThreshold: 400 } },
  { name: "Shredded Duck Confit", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 12, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@duck" }, inventory: { currentStock: 1000, minThreshold: 100 } },
  { name: "King Prawns", category: "MEAT_TOPPING", unitType: "COUNT", defaultQuantity: 5, pricePerUnit: 40, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@praw" }, inventory: { currentStock: 500, minThreshold: 100 } },
  { name: "Lobster Meat Chunks", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 25, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@lobs" }, inventory: { currentStock: 300, minThreshold: 50 } },
  { name: "Smoked Salmon", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 40, pricePerUnit: 15, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@salm" }, inventory: { currentStock: 500, minThreshold: 100 } },
  { name: "Turkey Breast Slices", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 60, pricePerUnit: 3, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@turk" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Lamb Merguez Sausage", category: "MEAT_TOPPING", unitType: "GRAM", defaultQuantity: 50, pricePerUnit: 6, image: { url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee", credit: "@lamb" }, inventory: { currentStock: 1500, minThreshold: 150 } },

  // --- CATEGORY: HERB & SPICE & EXTRA (96-100) ---
  { name: "Oregano Dried", category: "SPICE", unitType: "GRAM", defaultQuantity: 2, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@oreg" }, inventory: { currentStock: 1000, minThreshold: 100 } },
  { name: "Red Chili Flakes", category: "SPICE", unitType: "GRAM", defaultQuantity: 3, pricePerUnit: 1, image: { url: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b", credit: "@cflk" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Extra Virgin Olive Oil", category: "EXTRA", unitType: "ML", defaultQuantity: 15, pricePerUnit: 2, image: { url: "https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf", credit: "@evoo" }, inventory: { currentStock: 5000, minThreshold: 500 } },
  { name: "Hot Honey Drizzle", category: "EXTRA", unitType: "ML", defaultQuantity: 10, pricePerUnit: 5, image: { url: "https://images.unsplash.com/photo-1589733901241-5d52ac757514", credit: "@honey" }, inventory: { currentStock: 2000, minThreshold: 200 } },
  { name: "Balsamic Glaze", category: "EXTRA", unitType: "ML", defaultQuantity: 10, pricePerUnit: 4, image: { url: "https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf", credit: "@bals" }, inventory: { currentStock: 2000, minThreshold: 200 } }
];

module.exports = {
  pizzaPacks,
  ingredients
};
