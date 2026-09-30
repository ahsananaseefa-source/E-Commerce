import { WishlistItem } from '../../core/models/wishlist-item.models';

export interface WishlistState {
  items: WishlistItem[];
}

export const initialWishlistState: WishlistState = {
  items: []
};