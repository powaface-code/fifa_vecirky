const Stripe = require('stripe');

const BG_NAMES = {
  tom:   'Real Madrid pozadí',
  luke:  'PSG pozadí',
  kubik: 'Barcelona pozadí',
  jirik: 'Liverpool pozadí',
};

// URL appky na GitHub Pages
const APP_URL = 'https://powaface-code.github.io/fifa_vecirky';

module.exports = async function (req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { bg } = req.query;
  if (!BG_NAMES[bg]) return res.status(400).json({ error: 'Neplatné pozadí' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'czk',
          product_data: { name: `FIFA Večírky · ${BG_NAMES[bg]}` },
          unit_amount: 1500, // 15 Kč v haléřích
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { bg },
      // Po zaplacení Stripe přesměruje zpět s session ID
      success_url: `${APP_URL}/?payment=ok&bg=${bg}&session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/`,
    });

    // Přesměruj na Stripe platební stránku
    res.redirect(303, session.url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
