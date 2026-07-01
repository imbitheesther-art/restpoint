
export const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

        user.twoFactorOTP = hashedOTP;
        user.twoFactorOTPExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            to: user.email,
            subject: "Your new OTP",
            html: `<h1>${otp}</h1><p>Valid for 5 minutes</p>`,
        });

        res.json({ message: "OTP resent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
