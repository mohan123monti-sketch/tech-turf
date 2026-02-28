import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/user.model.js';

// Function to configure OAuth strategies (called after env vars are loaded)
export const configureStrategies = () => {
    console.log('Configuring OAuth Strategies...');
    console.log('Google OAuth Config Check:', {
        hasClientID: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientID: process.env.GOOGLE_CLIENT_ID?.substring(0, 30) + '...'
    });

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('✓ Registering Google OAuth Strategy');
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/social/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // User exists, update Google ID if not set
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    password: Math.random().toString(36).slice(-8) // Random password (won't be used)
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }));
    } else {
        console.log('✗ Google OAuth not configured (missing credentials)');
    }

    // Facebook OAuth Strategy
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        console.log('✓ Registering Facebook OAuth Strategy');
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/social/facebook/callback`,
            profileFields: ['id', 'displayName', 'emails']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // User exists, update Facebook ID if not set
                    if (!user.facebookId) {
                        user.facebookId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
                    email: profile.emails[0].value,
                    facebookId: profile.id,
                    password: Math.random().toString(36).slice(-8) // Random password (won't be used)
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }));
    } else {
        console.log('✗ Facebook OAuth not configured (missing credentials)');
    }
};

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
