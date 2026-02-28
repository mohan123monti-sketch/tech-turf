import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send order confirmation email
export const sendOrderConfirmation = async (order, user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tech Turf" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Order Confirmation - #${order._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0B3C8C;">Order Confirmation</h2>
                <p>Hi ${user.username},</p>
                <p>Thank you for your order! Your order has been received and is being processed.</p>
                
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalPrice?.toFixed(2)}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <h3>Items Ordered:</h3>
                    ${order.orderItems?.map(item => `
                        <div style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.qty || item.quantity || 1} × ₹${item.price?.toFixed(2)}
                        </div>
                    `).join('')}
                </div>
                
                <p style="margin-top: 30px;">
                    You can track your order status in your <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/orders.html">account dashboard</a>.
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    If you have any questions, please contact us at support@techturf.com
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to:', user.email);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

// Send order status update email
export const sendOrderStatusUpdate = async (order, user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tech Turf" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Order Update - #${order._id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0B3C8C;">Order Status Update</h2>
                <p>Hi ${user.username},</p>
                <p>Your order status has been updated.</p>

                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3>Order Status</h3>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
                    <p><strong>Total Amount:</strong> ₹${order.totalPrice?.toFixed(2)}</p>
                </div>

                <p style="margin-top: 30px;">
                    Track your order in your <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/orders.html">account dashboard</a>.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order status email sent to:', user.email);
    } catch (error) {
        console.error('Error sending order status email:', error);
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password.html?token=${resetToken}`;

    const mailOptions = {
        from: `"Tech Turf" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0B3C8C;">Password Reset Request</h2>
                <p>You requested a password reset for your Tech Turf account.</p>
                
                <div style="margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background: #F26522; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #666;">Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #0B3C8C;">${resetUrl}</p>
                
                <p style="margin-top: 30px; color: #666;">
                    This link will expire in 1 hour.
                </p>
                
                <p style="color: #666;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Tech Turf" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Welcome to Tech Turf!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0B3C8C;">Welcome to Tech Turf!</h2>
                <p>Hi ${user.username},</p>
                <p>Thank you for joining Tech Turf - your gateway to cutting-edge technology and innovation.</p>
                
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h3>Get Started:</h3>
                    <ul>
                        <li>Explore our <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/shopping.html">product catalog</a></li>
                        <li>Check out our latest <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/projects.html">projects</a></li>
                        <li>Chat with <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/nexus_ai.html">Nexus AI</a> for assistance</li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    Questions? Contact us at support@techturf.com
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', user.email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

export default {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendPasswordResetEmail,
    sendWelcomeEmail
};
