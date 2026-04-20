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
        // For non-owners, hide reservation details if the wishlist has hideReserverName enabled
        const hidden = item.toObject();
        if (wishlist.hideReserverName) {
          hidden.status = 'available';
          hidden.reservedBy = null;
          hidden.reserverName = null;
          hidden.reservedAt = null;
          hidden.orderedAt = null;
          hidden.deliveredAt = null;
          hidden.platform = null;
          hidden.orderNotes = null;
        }
        return hidden;
      }

      return item;
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

    if (item.status !== 'available') {
      return res.status(400).json({ message: 'This item is already reserved or ordered' });
    }

    const wishlist = await Wishlist.findById(item.wishlistId);

    item.status = 'reserved';
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
    item.orderedAt = null;
    item.deliveredAt = null;
    item.platform = null;
    item.orderNotes = null;

    await item.save();

    res.status(200).json({
      message: 'Item unreserved successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unreserving item', error: error.message });
  }
};

export const orderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, orderNotes } = req.body;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reservedBy?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to order this item' });
    }

    if (item.status !== 'reserved') {
      return res.status(400).json({ message: 'Item must be reserved before ordering' });
    }

    item.status = 'ordered';
    item.orderedAt = Date.now();
    item.platform = platform;
    item.orderNotes = orderNotes;

    await item.save();

    res.status(200).json({
      message: 'Item marked as ordered successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error ordering item', error: error.message });
  }
};

export const deliverItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reservedBy?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this item as delivered' });
    }

    if (item.status !== 'ordered') {
      return res.status(400).json({ message: 'Item must be ordered before marking as delivered' });
    }

    item.status = 'delivered';
    item.deliveredAt = Date.now();

    await item.save();

    res.status(200).json({
      message: 'Item marked as delivered successfully',
      item
    });
  } catch (error) {
    res.status(500).json({ message: 'Error delivering item', error: error.message });
  }
};

export const getGiftActivityForFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Check if user is trying to view their own gift activity (not allowed)
    if (friendId === userId) {
      return res.status(403).json({ message: 'Cannot view your own gift activity' });
    }

    // Any authenticated user can view gift activity for others to prevent duplicates
    // Only restriction is users cannot view their own gift activity

    // Get all wishlists for this friend
    const wishlists = await Wishlist.find({ userId: friendId });

    if (wishlists.length === 0) {
      return res.status(200).json({ items: [] });
    }

    const wishlistIds = wishlists.map(w => w._id);

    // Get all items from friend's wishlists that are reserved or ordered
    const items = await Item.find({
      wishlistId: { $in: wishlistIds },
      status: { $in: ['reserved', 'ordered', 'delivered'] }
    })
      .populate('wishlistId', 'title')
      .populate('reservedBy', 'name')
      .sort({ reservedAt: -1, orderedAt: -1 });

    // Return full details for all authenticated viewers
    // This enables duplicate prevention while maintaining surprise for receivers
    const responseItems = items.map(item => {
      const itemObj = item.toObject();
      return itemObj;
    });

    res.status(200).json({
      items: responseItems,
      friendId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gift activity', error: error.message });
  }
};
