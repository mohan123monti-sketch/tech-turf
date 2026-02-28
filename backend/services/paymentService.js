import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Create payment intent for checkout
export const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        throw error;
    }
};

// Verify payment status
export const verifyPayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    } catch (error) {
        console.error('Stripe verification error:', error);
        throw error;
    }
};

// Create refund
export const createRefund = async (paymentIntentId, amount = null) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined
        });

        return refund;
    } catch (error) {
        console.error('Stripe refund error:', error);
        throw error;
    }
};

export default {
    createPaymentIntent,
    verifyPayment,
    createRefund
};
