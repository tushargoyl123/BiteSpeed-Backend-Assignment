// contactController.js
const express = require('express');
const pool = require('./db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    // Check if there's an existing contact with the given email or phone number
    const existingContactQuery = {
      text: 'SELECT * FROM contact WHERE email = ? OR phoneNumber = ?',
      values: [email, phoneNumber],
    };
    console.log(existingContactQuery);
    const [existingContactResult] = await pool.query(existingContactQuery.text, existingContactQuery.values);
    console.log(existingContactResult)
    const existingContacts = existingContactResult.rows;

    if (!existingContacts || existingContacts.length === 0) {
      // If no existing contacts, create a new primary contact
      const createPrimaryContactQuery = {
        text: 'INSERT INTO contact (email, phoneNumber, linkPrecedence) VALUES (?, ?, ?)',
        values: [email, phoneNumber, 'primary'],
      };
      const [newContactResult] = await pool.query(createPrimaryContactQuery.text, createPrimaryContactQuery.values);
      const primaryContactId = newContactResult.insertId;

      res.status(200).json({
        contact: {
          primaryContactId: primaryContactId,
          emails: [email],
          phoneNumbers: [phoneNumber],
          secondaryContactIds: [],
        },
      });
    } else {
      // Consolidate contacts
      const primaryContact = existingContacts.find(contact => contact.linkPrecedence === 'primary');
      const primaryContactId = primaryContact.id;
      const primaryEmail = primaryContact.email;
      const primaryPhoneNumber = primaryContact.phoneNumber;

      const secondaryContacts = existingContacts.filter(contact => contact.linkPrecedence === 'secondary');
      const secondaryContactIds = secondaryContacts.map(contact => contact.id);
      const emails = [primaryEmail, ...(email ? [email] : [])];
      const phoneNumbers = [primaryPhoneNumber, ...(phoneNumber ? [phoneNumber] : [])];

      if (email && email !== primaryEmail) {
        // If a new email is provided, create a secondary contact
        const createSecondaryContactQuery = {
          text: 'INSERT INTO contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)',
          values: [email, primaryPhoneNumber, primaryContactId, 'secondary'],
        };
        await pool.query(createSecondaryContactQuery.text, createSecondaryContactQuery.values);
      }

      if (phoneNumber && phoneNumber !== primaryPhoneNumber) {
        // If a new phone number is provided, create a secondary contact
        const createSecondaryContactQuery = {
          text: 'INSERT INTO contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)',
          values: [primaryEmail, phoneNumber, primaryContactId, 'secondary'],
        };
        await pool.query(createSecondaryContactQuery.text, createSecondaryContactQuery.values);
      }

      res.status(200).json({
        contact: {
          primaryContactId: primaryContactId,
          emails: emails,
          phoneNumbers: phoneNumbers,
          secondaryContactIds: secondaryContactIds,
        },
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
