const OAuthClient = require('intuit-oauth');
const QuickBooks = require('node-quickbooks');

const oauthClient = new OAuthClient({
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI
});

// Get authorization URL
const getAuthUrl = () => {
  return oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: 'rrmp-quickbooks'
  });
};

// Exchange code for tokens
const getTokens = async (url) => {
  const authResponse = await oauthClient.createToken(url);
  return authResponse.getJson();
};

// Create an invoice in QuickBooks
const createInvoice = async (tokens, companyId, customerName, overageHours, overageRate) => {
  const qbo = new QuickBooks(
    process.env.QUICKBOOKS_CLIENT_ID,
    process.env.QUICKBOOKS_CLIENT_SECRET,
    tokens.access_token,
    false,
    companyId,
    process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox',
    false,
    null,
    '2.0',
    tokens.refresh_token
  );

  const invoice = {
    Line: [
      {
        Amount: overageHours * overageRate,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1', name: 'Services' },
          Qty: overageHours,
          UnitPrice: overageRate
        },
        Description: `Room booking overage - ${overageHours} hours at $${overageRate}/hr`
      }
    ],
    CustomerRef: { name: customerName }
  };

  return new Promise((resolve, reject) => {
    qbo.createInvoice(invoice, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

module.exports = { getAuthUrl, getTokens, createInvoice };