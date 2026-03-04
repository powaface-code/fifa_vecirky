const Stripe = require('stripe');

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { session, bg } = req.query;
  if (!session || !bg) return res.status(400).json({ ok: false, error: 'Chybí parametry' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const s = await stripe.checkout.sessions.retrieve(session);

    // Ověř: platba proběhla + bg odpovídá tomu co bylo zaplaceno
    if (s.payment_status !== 'paid') {
      return res.json({ ok: false, error: 'Platba nepřipadá jako zaplacená' });
    }
    if (s.metadata.bg !== bg) {
      return res.json({ ok: false, error: 'Nesoulad pozadí' });
    }

    res.json({ ok: true, bg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
