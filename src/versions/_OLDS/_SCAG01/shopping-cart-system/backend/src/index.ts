import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Cart (calculates totals dynamically)
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: { product: true },
      orderBy: { id: 'asc' }
    });

    const activeItems = cartItems.filter((i: any) => i.status === 'active');
    const savedItems = cartItems.filter((i: any) => i.status === 'saved');

    // calculate totals for active items using integer math
    const enrichedActiveItems = activeItems.map((item: any) => ({
      ...item,
      lineTotal: item.quantity * item.product.priceCents,
    }));

    const grandTotal = enrichedActiveItems.reduce((acc: number, item: any) => acc + item.lineTotal, 0);

    res.json({
      activeItems: enrichedActiveItems,
      savedItems,
      grandTotal,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to Cart (Handles Scenario 2: Merge Items Logic and Edge Case 1: Add More Than Stock)
app.post('/api/cart/add', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Find if already in cart as active
    const existingItem = await prisma.cartItem.findFirst({
      where: { productId, status: 'active' },
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      return res.status(400).json({ error: 'สินค้าไม่เพียงพอ' });
    }

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          productId,
          quantity,
          status: 'active',
        },
      });
    }

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Cart Item Quantity (Handles Scenario 1 and Edge Case 1)
app.put('/api/cart/:id/quantity', async (req, res) => {
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ error: 'สินค้าไม่เพียงพอ' });
    }

    if (quantity <= 0) {
      // If quantity drops to 0 or less, remove it
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ message: 'Item removed' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save for Later (Handles Scenario 3)
app.put('/api/cart/:id/save', async (req, res) => {
  const itemId = parseInt(req.params.id);
  
  try {
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { status: 'saved' },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move back to active cart from Saved Items
app.put('/api/cart/:id/move-to-cart', async (req, res) => {
  const itemId = parseInt(req.params.id);
  
  try {
    const cartItem = await prisma.cartItem.findUnique({ 
      where: { id: itemId },
      include: { product: true }
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    // Check stock before moving back combining with existing active if any
    const existingActive = await prisma.cartItem.findFirst({
       where: { productId: cartItem.productId, status: 'active' }
    });

    const currentActiveQty = existingActive ? existingActive.quantity : 0;
    const newQty = currentActiveQty + cartItem.quantity;
    
    if (newQty > cartItem.product.stock) {
       return res.status(400).json({ error: 'สินค้าไม่เพียงพอ (สต็อกไม่พอสำหรับการดึงรายการกลับ)' });
    }

    if (existingActive) {
      // consolidate
      await prisma.cartItem.update({
         where: { id: existingActive.id },
         data: { quantity: newQty }
      });
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { status: 'active' },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Remove Item Completely
app.delete('/api/cart/:id/remove', async (req, res) => {
  const itemId = parseInt(req.params.id);
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Database Seed Route for testing convenience
app.post('/api/seed', async (req, res) => {
  try {
    // clear existing
    await prisma.cartItem.deleteMany();
    await prisma.product.deleteMany();

    // Create seed products matching scenarios
    await prisma.product.createMany({
      data: [
        { sku: 'SKU-001', name: 'Product A (100 THB)', priceCents: 10000, stock: 10 },
        { sku: 'SKU-002', name: 'Product B (Float Test)', priceCents: 1999, stock: 10 },
        { sku: 'SKU-003', name: 'Product C (Limited Stock)', priceCents: 5000, stock: 5 },
        { sku: 'SKU-004', name: 'Product D', priceCents: 20000, stock: 20 },
        { sku: 'SKU-005', name: 'Product E (For saving later)', priceCents: 35000, stock: 15 },
      ]
    });
    
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
