/* ===================== FORGOT PASSWORD ===================== */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        // const resetUrl = `https://2-factor-authentication-lovat.vercel.app/reset-password/${resetToken}`;
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: "Reset your password",
            html: `
        <h2>Password Reset</h2>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Link valid for 15 minutes</p>
      `,
        });

        res.status(200).json({ message: "Reset link sent to email" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};