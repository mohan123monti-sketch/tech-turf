import asyncHandler from 'express-async-handler';

// COD Configuration middleware
export const getCODConfig = asyncHandler(async (req, res) => {
    const config = {
        enabled: process.env.COD_ENABLED === 'true',
        fee: parseFloat(process.env.COD_FEE || '0'),
        maxAmount: parseFloat(process.env.COD_MAX_AMOUNT || '10000'),
        availableRegions: (process.env.COD_AVAILABLE_REGIONS || 'USA').split(',').map(r => r.trim())
    };

    res.json(config);
});

// Validate COD eligibility
export const validateCODOrder = (orderData) => {
    const codEnabled = process.env.COD_ENABLED === 'true';
    const maxAmount = parseFloat(process.env.COD_MAX_AMOUNT || '10000');
    const availableRegions = (process.env.COD_AVAILABLE_REGIONS || 'USA').split(',').map(r => r.trim());

    if (!codEnabled) {
        return {
            valid: false,
            message: 'Cash on Delivery is currently not available'
        };
    }

    if (orderData.totalPrice > maxAmount) {
        return {
            valid: false,
            message: `Cash on Delivery is not available for orders above ₹${maxAmount}`
        };
    }

    const region = orderData.shippingAddress?.country || 'India';
    if (!availableRegions.includes(region)) {
        return {
            valid: false,
            message: `Cash on Delivery is not available in ${region}`
        };
    }

    return {
        valid: true,
        fee: parseFloat(process.env.COD_FEE || '0')
    };
};

export default {
    getCODConfig,
    validateCODOrder
};
