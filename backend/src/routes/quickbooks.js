const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokens, createInvoice } = require('../services/quickbooksService');

let qbTokens = null;
let qbCompanyId = null;

// Initiate QuickBooks OAuth
router.get('/connect', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

// QuickBooks OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const tokens = await getTokens(req.url);
    qbTokens = tokens;
    qbCompanyId = req.query.realmId;
    res.json({ message: 'QuickBooks connected successfully', companyId: qbCompanyId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to connect to QuickBooks' });
  }
});

// Create invoice for a company overage
router.post('/invoice', async (req, res) => {
  if (!qbTokens || !qbCompanyId) {
    return res.status(400).json({ error: 'QuickBooks not connected' });
  }

  const { customerName, overageHours, overageRate } = req.body;

  try {
    const invoice = await createInvoice(qbTokens, qbCompanyId, customerName, overageHours, overageRate);
    res.json({ message: 'Invoice created', invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

module.exports = router;