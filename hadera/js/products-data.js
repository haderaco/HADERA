/* ==========================================================================
   HADÉRA — products-data.js
   Placeholder product catalog + pure rendering helpers.
   Replace DEMO_PRODUCTS / getProducts() internals with real API calls when
   the backend is ready — the rest of the app only talks to these functions.
   ========================================================================== */

const DEMO_PRODUCTS = [
  {
    id: 'car-001',
    name: 'Toyota Land Cruiser',
    category: 'cars',
    price: 68000000,
    location: 'Abuja',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622551766019-6cf62db8955a?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'A full-size SUV built for Nigerian roads without compromising on comfort. Thoroughly inspected and reconditioned before listing.',
    specifications: { Brand: 'Toyota', Model: 'Land Cruiser', Year: '2021', Mileage: '38,000 km', Transmission: 'Automatic', 'Fuel type': 'Petrol', Condition: 'Foreign used' }
  },
  {
    id: 'car-002',
    name: 'Mercedes-Benz GLE',
    category: 'cars',
    price: 85000000,
    location: 'Abuja',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605559911160-a3d95d4a7d75?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'A refined SUV that pairs effortless performance with a cabin built for long, comfortable journeys across the city or between states.',
    specifications: { Brand: 'Mercedes-Benz', Model: 'GLE 350', Year: '2022', Mileage: '21,500 km', Transmission: 'Automatic', 'Fuel type': 'Petrol', Condition: 'Foreign used' }
  },
  {
    id: 'car-003',
    name: 'Lexus RX',
    category: 'cars',
    price: 52000000,
    location: 'Lagos',
    availability: 'reserved',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617469767053-6f7d8f3f5d3a?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Quiet, dependable and comfortable — the Lexus RX is built for owners who want luxury without unnecessary complexity.',
    specifications: { Brand: 'Lexus', Model: 'RX 350', Year: '2020', Mileage: '44,000 km', Transmission: 'Automatic', 'Fuel type': 'Petrol', Condition: 'Nigerian used' }
  },
  {
    id: 'car-004',
    name: 'Toyota Prado',
    category: 'cars',
    price: 61000000,
    location: 'Port Harcourt',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'The Prado remains one of the most trusted SUVs on Nigerian roads — spacious, rugged and easy to maintain.',
    specifications: { Brand: 'Toyota', Model: 'Prado', Year: '2021', Mileage: '29,000 km', Transmission: 'Automatic', 'Fuel type': 'Diesel', Condition: 'Foreign used' }
  },
  {
    id: 'fur-001',
    name: 'Luxury 3-Seater Sofa',
    category: 'furniture',
    price: 950000,
    location: 'Abuja',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Hand-finished upholstery over a solid hardwood frame, designed to anchor a living room with quiet confidence.',
    specifications: { Material: 'Italian leather, hardwood frame', Dimensions: '220 × 95 × 85 cm', Color: 'Cognac tan', Condition: 'Brand new', Availability: 'In stock' }
  },
  {
    id: 'fur-002',
    name: 'Modern Dining Set',
    category: 'furniture',
    price: 1250000,
    location: 'Lagos',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'A six-seater dining set in solid oak with a matte finish, built for everyday family meals and quiet dinner parties alike.',
    specifications: { Material: 'Solid oak, brushed brass legs', Dimensions: '180 × 95 × 76 cm, 6 chairs', Color: 'Natural oak', Condition: 'Brand new', Availability: 'Made to order' }
  },
  {
    id: 'fur-003',
    name: 'Premium Bed Frame',
    category: 'furniture',
    price: 780000,
    location: 'Abuja',
    availability: 'available',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'An upholstered platform bed with a padded headboard, engineered for a quiet, sturdy night after night.',
    specifications: { Material: 'Linen upholstery, engineered wood', Dimensions: 'King, 200 × 200 cm', Color: 'Warm grey', Condition: 'Brand new', Availability: 'In stock' }
  },
  {
    id: 'fur-004',
    name: 'Executive Office Chair',
    category: 'furniture',
    price: 420000,
    location: 'Port Harcourt',
    availability: 'sold',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1200&auto=format&fit=crop'
    ],
    description: 'Ergonomic support built for long work days, upholstered in breathable mesh with adjustable lumbar support.',
    specifications: { Material: 'Mesh back, leather seat', Dimensions: '68 × 70 × 118 cm', Color: 'Charcoal black', Condition: 'Brand new', Availability: 'Out of stock' }
  }
];

/* ---------- service-style accessors (swap internals for fetch() later) ---------- */

function getProducts(filters = {}) {
  let results = [...DEMO_PRODUCTS];
  if (filters.category) results = results.filter(p => p.category === filters.category);
  if (filters.location) results = results.filter(p => p.location === filters.location);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q));
  }
  if (filters.minPrice) results = results.filter(p => p.price >= Number(filters.minPrice));
  if (filters.maxPrice) results = results.filter(p => p.price <= Number(filters.maxPrice));
  if (filters.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (filters.sort === 'newest') results.reverse();
  return Promise.resolve(results);
}

function getProduct(id) {
  return Promise.resolve(DEMO_PRODUCTS.find(p => p.id === id) || null);
}

/* ---------- rendering ---------- */

function statusLabel(status) {
  return { available: 'Available', reserved: 'Reserved', sold: 'Sold out' }[status] || status;
}

function productCardHTML(p) {
  return `
    <article class="product-card reveal">
      <a href="product-details.html?id=${p.id}" class="product-card-media">
        <span class="product-badge status-${p.availability}">${statusLabel(p.availability)}</span>
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </a>
      <div class="product-card-body">
        <span class="product-card-cat">${p.category}</span>
        <h3 class="product-card-name">${p.name}</h3>
        <span class="product-card-loc">${p.location}</span>
        <span class="product-card-price">${HADERA.formatNaira(p.price)}</span>
        <a href="product-details.html?id=${p.id}" class="product-card-cta">View details</a>
      </div>
    </article>
  `;
}

function renderProductGrid(container, products) {
  if (!products.length) {
    container.innerHTML = `
      <div class="state-msg" style="grid-column:1/-1">
        <h3>No products match your filters</h3>
        <p>Try adjusting your search, category or price range.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(productCardHTML).join('');
  HADERA.initReveal();
}

function renderSkeletonGrid(container, count = 8) {
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="product-card">
      <div class="skeleton" style="aspect-ratio:4/3"></div>
      <div style="padding:1.15rem 1.25rem">
        <div class="skeleton" style="height:12px;width:40%;margin-bottom:10px"></div>
        <div class="skeleton" style="height:18px;width:80%;margin-bottom:10px"></div>
        <div class="skeleton" style="height:14px;width:55%"></div>
      </div>
    </div>
  `).join('');
}
