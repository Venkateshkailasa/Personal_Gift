import Item from '../models/Item.js';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.js';
import Circle from '../models/Circle.js';

export const addItem = async (req, res) => {
  try {
    const { wishlistId, name, productLink, description, productImage } = req.body;
    const userId = req.userId;

    if (!wishlistId || !name) {
      return res.status(400).json({ message: 'Wishlist ID and item name are required' });
    }

    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    if (wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to add items to this wishlist' });
    }

    const item = new Item({
      wishlistId,
      name,
      productLink,
      productImage,
      description,
      status: 'available'
    });

    await item.save();

    res.status(201).json({
      message: 'Item added successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item', error: error.message });
  }
};

export const getItemsByWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const userId = req.userId;

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const currentUser = await User.findById(userId);
    const isOwner = wishlist.userId.toString() === userId;
    let allowed = isOwner || wishlist.isPublic;

    if (!allowed) {
      const circleMember = await Circle.findOne({
        user: wishlist.userId,
        status: 'accepted',
        relationship: { $in: ['friend', 'family'] },
        $or: [
          { requester: userId },
          { email: currentUser?.email }
        ]
      });

      allowed = !!circleMember;
    }

    if (!allowed) {
      return res.status(403).json({ message: 'Not authorized to view items for this wishlist' });
    }

    const items = await Item.find({ wishlistId })
      .populate('reservedBy', 'name email')
      .sort({ createdAt: -1 });

    const responseItems = items.map((item) => {
      if (!isOwner) {
        return item;
      }

      const hidden = item.toObject();
      hidden.status = 'available';
      hidden.reservedBy = null;
      hidden.reserverName = null;
      hidden.reservedAt = null;
      return hidden;
    });

    res.status(200).json({
      items: responseItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, productLink, description, productImage } = req.body;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const wishlist = await Wishlist.findById(item.wishlistId);

    if (wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.name = name || item.name;
    item.productLink = productLink || item.productLink;
    item.productImage = productImage !== undefined ? productImage : item.productImage;
    item.description = description || item.description;

    await item.save();

    res.status(200).json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const wishlist = await Wishlist.findById(item.wishlistId);

    if (wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};

export const reserveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { reserverName } = req.body;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status === 'taken') {
      return res.status(400).json({ message: 'This item is already reserved' });
    }

    const wishlist = await Wishlist.findById(item.wishlistId);

    item.status = 'taken';
    item.reservedBy = userId;
    item.reserverName = reserverName || 'Anonymous';
    item.reservedAt = Date.now();

    await item.save();

    res.status(200).json({
      message: 'Item reserved successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reserving item', error: error.message });
  }
};

export const unreserveItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const wishlist = await Wishlist.findById(item.wishlistId);

    if (item.reservedBy?.toString() !== userId && wishlist.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to unreserve this item' });
    }

    item.status = 'available';
    item.reservedBy = null;
    item.reserverName = null;
    item.reservedAt = null;

    await item.save();

    res.status(200).json({
      message: 'Item unreserved successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unreserving item', error: error.message });
  }
};
