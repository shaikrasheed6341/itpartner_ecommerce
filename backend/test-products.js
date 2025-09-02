const products = [
  {
    name: "HD CCTV Camera",
    brand: "Hikvision",
    image_url: "https://example.com/cctv-camera.jpg",
    quantity: 15,
    rate: 2500.00
  },
  {
    name: "8GB DDR4 RAM",
    brand: "Kingston",
    image_url: "https://example.com/ram.jpg",
    quantity: 25,
    rate: 1200.00
  },
  {
    name: "1TB SATA Hard Disk",
    brand: "Seagate",
    image_url: "https://example.com/hard-disk.jpg",
    quantity: 10,
    rate: 3500.00
  },
  {
    name: "WiFi Router 300Mbps",
    brand: "TP-Link",
    image_url: "https://example.com/router.jpg",
    quantity: 8,
    rate: 1800.00
  },
  {
    name: "256GB SSD",
    brand: "Samsung",
    image_url: "https://example.com/ssd.jpg",
    quantity: 12,
    rate: 2800.00
  }
];

async function addProducts() {
  for (const product of products) {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Added: ${product.name}`);
      } else {
        console.error(`❌ Failed to add ${product.name}:`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error adding ${product.name}:`, error);
    }
  }
}

// Run the function
addProducts();
