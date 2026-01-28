import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, avatarUrl } = req.body;

    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url)
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, avatar_url`,
      [firstName, lastName, phone, avatarUrl, req.user!.id]
    );

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update password
export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      currentPassword,
      userResult.rows[0].password_hash
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user!.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// Get all addresses
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, label, street_address, apartment, city, state, zip_code, country,
              latitude, longitude, is_default
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [req.user!.id]
    );

    res.json({
      addresses: result.rows.map(addr => ({
        id: addr.id,
        label: addr.label,
        streetAddress: addr.street_address,
        apartment: addr.apartment,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        country: addr.country,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isDefault: addr.is_default,
      })),
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

// Add address
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      label,
      streetAddress,
      apartment,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    // If this is the default address, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
        [req.user!.id]
      );
    }

    const result = await query(
      `INSERT INTO addresses
       (user_id, label, street_address, apartment, city, state, zip_code, country, latitude, longitude, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user!.id,
        label || 'Home',
        streetAddress,
        apartment,
        city,
        state,
        zipCode,
        country || 'USA',
        latitude,
        longitude,
        isDefault || false,
      ]
    );

    const addr = result.rows[0];

    res.status(201).json({
      address: {
        id: addr.id,
        label: addr.label,
        streetAddress: addr.street_address,
        apartment: addr.apartment,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        country: addr.country,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isDefault: addr.is_default,
      },
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

// Update address
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      label,
      streetAddress,
      apartment,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
    } = req.body;

    const result = await query(
      `UPDATE addresses
       SET label = COALESCE($1, label),
           street_address = COALESCE($2, street_address),
           apartment = COALESCE($3, apartment),
           city = COALESCE($4, city),
           state = COALESCE($5, state),
           zip_code = COALESCE($6, zip_code),
           country = COALESCE($7, country),
           latitude = COALESCE($8, latitude),
           longitude = COALESCE($9, longitude)
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        label,
        streetAddress,
        apartment,
        city,
        state,
        zipCode,
        country,
        latitude,
        longitude,
        id,
        req.user!.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const addr = result.rows[0];

    res.json({
      address: {
        id: addr.id,
        label: addr.label,
        streetAddress: addr.street_address,
        apartment: addr.apartment,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        country: addr.country,
        latitude: addr.latitude,
        longitude: addr.longitude,
        isDefault: addr.is_default,
      },
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
};

// Delete address
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
};

// Set default address
export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Unset all defaults
    await query(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
      [req.user!.id]
    );

    // Set new default
    const result = await query(
      'UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Default address updated' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
};

// Update FCM token
export const updateFcmToken = async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken } = req.body;

    await query(
      'UPDATE users SET fcm_token = $1 WHERE id = $2',
      [fcmToken, req.user!.id]
    );

    res.json({ message: 'FCM token updated' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
};
