require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const DeliveryPartner = require('../models/DeliveryPartner');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopkeepers');
    console.log('Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}), MenuItem.deleteMany({}), Customer.deleteMany({}),
      Order.deleteMany({}), Payment.deleteMany({}), DeliveryPartner.deleteMany({})
    ]);
    console.log('Cleared all collections');

    // Create restaurant owner
    const user = await User.create({
      name: 'Raj Kumar', email: 'admin@restaurant.com', password: 'password123',
      phone: '9876543210', restaurantName: 'Spice Kitchen',
      restaurantAddress: '123 MG Road, Koramangala, Bangalore - 560034',
      cuisine: ['North Indian', 'Chinese', 'South Indian'], isOpen: true
    });
    console.log('Created user: admin@restaurant.com / password123');

    // Create menu items
    const menuData = [
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', price: 249, category: 'Starters', isVeg: true, preparationTime: 20 },
      { name: 'Chicken Wings', description: 'Crispy fried chicken wings with spicy sauce', price: 299, category: 'Starters', isVeg: false, preparationTime: 25 },
      { name: 'Spring Rolls', description: 'Crispy rolls filled with mixed vegetables', price: 179, category: 'Starters', isVeg: true, preparationTime: 15 },
      { name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 99, category: 'Snacks', isVeg: true, preparationTime: 10 },
      { name: 'Butter Chicken', description: 'Tender chicken in rich tomato butter gravy', price: 349, category: 'Main Course', isVeg: false, preparationTime: 30 },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in creamy tomato gravy', price: 279, category: 'Main Course', isVeg: true, preparationTime: 25 },
      { name: 'Dal Makhani', description: 'Black lentils slow-cooked with butter and cream', price: 229, category: 'Main Course', isVeg: true, preparationTime: 35 },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 329, category: 'Biryani', isVeg: false, preparationTime: 40 },
      { name: 'Veg Biryani', description: 'Aromatic rice with mixed vegetables and spices', price: 249, category: 'Biryani', isVeg: true, preparationTime: 35 },
      { name: 'Mutton Biryani', description: 'Premium basmati rice with tender mutton pieces', price: 399, category: 'Biryani', isVeg: false, preparationTime: 45 },
      { name: 'Veg Manchurian', description: 'Vegetable balls in tangy Manchurian sauce', price: 199, category: 'Chinese', isVeg: true, preparationTime: 20 },
      { name: 'Chilli Chicken', description: 'Spicy chicken with peppers and onions', price: 279, category: 'Chinese', isVeg: false, preparationTime: 25 },
      { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 149, category: 'South Indian', isVeg: true, preparationTime: 15 },
      { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 99, category: 'South Indian', isVeg: true, preparationTime: 10 },
      { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella and tomato sauce', price: 249, category: 'Pizza', isVeg: true, preparationTime: 20 },
      { name: 'Paneer Tikka Pizza', description: 'Indian fusion pizza with tandoori paneer', price: 329, category: 'Pizza', isVeg: true, preparationTime: 25 },
      { name: 'Classic Veg Burger', description: 'Veggie patty with fresh lettuce and cheese', price: 149, category: 'Burger', isVeg: true, preparationTime: 15 },
      { name: 'Chicken Burger', description: 'Grilled chicken patty with mayo and veggies', price: 199, category: 'Burger', isVeg: false, preparationTime: 15 },
      { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 99, category: 'Desserts', isVeg: true, preparationTime: 5 },
      { name: 'Brownie with Ice Cream', description: 'Warm chocolate brownie with vanilla ice cream', price: 179, category: 'Desserts', isVeg: true, preparationTime: 10 },
      { name: 'Mango Lassi', description: 'Refreshing mango yogurt drink', price: 99, category: 'Beverages', isVeg: true, preparationTime: 5 },
      { name: 'Cold Coffee', description: 'Chilled coffee blended with ice cream', price: 129, category: 'Beverages', isVeg: true, preparationTime: 5 },
    ];
    const menuItems = await MenuItem.insertMany(menuData.map(item => ({ ...item, restaurant: user._id })));
    console.log(`Created ${menuItems.length} menu items`);

    // Create customers
    const customerData = [
      { name: 'Priya Sharma', phone: '9812345001', email: 'priya@email.com', address: '45 Indiranagar, Bangalore' },
      { name: 'Amit Patel', phone: '9812345002', email: 'amit@email.com', address: '78 HSR Layout, Bangalore' },
      { name: 'Sneha Reddy', phone: '9812345003', email: 'sneha@email.com', address: '12 Whitefield, Bangalore' },
      { name: 'Vikram Singh', phone: '9812345004', email: 'vikram@email.com', address: '33 JP Nagar, Bangalore' },
      { name: 'Ananya Iyer', phone: '9812345005', email: 'ananya@email.com', address: '56 Malleshwaram, Bangalore' },
      { name: 'Rahul Gupta', phone: '9812345006', email: 'rahul@email.com', address: '90 BTM Layout, Bangalore' },
      { name: 'Kavita Nair', phone: '9812345007', email: 'kavita@email.com', address: '23 Jayanagar, Bangalore' },
      { name: 'Deepak Joshi', phone: '9812345008', email: 'deepak@email.com', address: '67 Electronic City, Bangalore' },
      { name: 'Meera Menon', phone: '9812345009', email: 'meera@email.com', address: '45 Koramangala 5th Block, Bangalore' },
      { name: 'Arjun Das', phone: '9812345010', email: 'arjun@email.com', address: '11 Marathahalli, Bangalore' },
      { name: 'Ritu Agarwal', phone: '9812345011', email: 'ritu@email.com', address: '34 Sarjapur Road, Bangalore' },
      { name: 'Sanjay Verma', phone: '9812345012', email: 'sanjay@email.com', address: '78 Yelahanka, Bangalore' },
      { name: 'Pooja Hegde', phone: '9812345013', email: 'pooja@email.com', address: '22 Bannerghatta Road, Bangalore' },
      { name: 'Karthik Rao', phone: '9812345014', email: 'karthik@email.com', address: '55 Hebbal, Bangalore' },
      { name: 'Divya Krishnan', phone: '9812345015', email: 'divya@email.com', address: '88 MG Road, Bangalore' },
    ];
    const customers = await Customer.insertMany(customerData);
    console.log(`Created ${customers.length} customers`);

    // Create orders
    const statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Delivered', 'Delivered', 'Cancelled'];
    const instructions = ['', 'Ring the bell twice', 'Leave at door', 'Call before delivery', 'No onion no garlic', ''];
    const orders = [];

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      const usedIndexes = new Set();
      for (let j = 0; j < numItems; j++) {
        let idx;
        do { idx = Math.floor(Math.random() * menuItems.length); } while (usedIndexes.has(idx));
        usedIndexes.add(idx);
        const item = menuItems[idx];
        const qty = Math.floor(Math.random() * 3) + 1;
        orderItems.push({ menuItem: item._id, name: item.name, quantity: qty, price: item.price });
      }

      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const paymentMethod = Math.random() > 0.4 ? 'Online' : 'COD';

      // Build timeline based on status
      const timeline = [{ status: 'Pending', timestamp: orderDate }];
      const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
      const statusIdx = statusFlow.indexOf(status);
      if (status === 'Cancelled') {
        timeline.push({ status: 'Cancelled', timestamp: new Date(orderDate.getTime() + 600000) });
      } else if (statusIdx > 0) {
        for (let s = 1; s <= statusIdx; s++) {
          timeline.push({ status: statusFlow[s], timestamp: new Date(orderDate.getTime() + s * 600000) });
        }
      }

      orders.push({
        orderNumber: `ORD-${String(10001 + i).padStart(5, '0')}`,
        restaurant: user._id,
        customer: customer._id,
        items: orderItems,
        totalAmount,
        status,
        paymentMethod,
        paymentStatus: status === 'Delivered' ? 'Paid' : 'Pending',
        deliveryAddress: customer.address,
        deliveryInstructions: instructions[Math.floor(Math.random() * instructions.length)],
        estimatedDeliveryTime: 30 + Math.floor(Math.random() * 30),
        timeline,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`Created ${createdOrders.length} orders`);

    // Update customer stats
    for (const customer of customers) {
      const customerOrders = createdOrders.filter(o => o.customer.toString() === customer._id.toString());
      if (customerOrders.length > 0) {
        await Customer.findByIdAndUpdate(customer._id, {
          totalOrders: customerOrders.length,
          totalSpent: customerOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          lastOrderDate: customerOrders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt
        });
      }
    }

    // Create payments
    const payments = createdOrders.map(order => ({
      order: order._id,
      restaurant: user._id,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      status: order.status === 'Delivered' ? 'Completed' : order.status === 'Cancelled' ? 'Failed' : 'Pending',
      transactionId: order.paymentMethod === 'Online' ? `TXN${Date.now()}${Math.random().toString(36).substr(2, 6)}` : '',
      createdAt: order.createdAt,
    }));
    await Payment.insertMany(payments);
    console.log(`Created ${payments.length} payments`);

    // Create delivery partners
    const partnerData = [
      { name: 'Ravi Kumar', phone: '9900100001', vehicleNumber: 'KA-01-AB-1234', vehicleType: 'Bike', totalDeliveries: 156, rating: 4.7 },
      { name: 'Suresh Babu', phone: '9900100002', vehicleNumber: 'KA-01-CD-5678', vehicleType: 'Scooter', totalDeliveries: 98, rating: 4.5 },
      { name: 'Mohammed Ali', phone: '9900100003', vehicleNumber: 'KA-01-EF-9012', vehicleType: 'Bike', totalDeliveries: 234, rating: 4.8 },
      { name: 'Ganesh Prasad', phone: '9900100004', vehicleNumber: 'KA-01-GH-3456', vehicleType: 'Bicycle', totalDeliveries: 67, rating: 4.3 },
      { name: 'Anil Sharma', phone: '9900100005', vehicleNumber: 'KA-01-IJ-7890', vehicleType: 'Bike', totalDeliveries: 189, rating: 4.6 },
    ];
    await DeliveryPartner.insertMany(partnerData);
    console.log(`Created ${partnerData.length} delivery partners`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Login: admin@restaurant.com / password123\n');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
