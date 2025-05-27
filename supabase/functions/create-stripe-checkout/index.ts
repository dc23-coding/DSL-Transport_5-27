// Use Node.js-compatible imports
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Stripe and Supabase with environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Export handler for Supabase Edge Function
exports.handler = async (req) => {
  try {
    const { tier, annual_billing, vehicle_count, organization_id } = req.body;

    const pricing = {
      starter: { monthly: 18, annual: 15 },
      professional: { monthly: 35, annual: 30 },
      enterprise: { monthly: 50, annual: 50 },
    };

    const pricePerVehicle = pricing[tier][annual_billing ? 'annual' : 'monthly'];
    const totalPrice = pricePerVehicle * vehicle_count * (annual_billing ? 12 : 1);
    const unitAmount = Math.round(totalPrice * 100); // Stripe expects cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan` },
          unit_amount: unitAmount,
          recurring: { interval: annual_billing ? 'year' : 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?cancel=true`,
      metadata: { organization_id, vehicle_count, tier },
    });

    // Save subscription to Supabase
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        organization_id,
        stripe_subscription_id: session.id,
        tier,
        vehicle_count,
        annual_billing,
      });
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};