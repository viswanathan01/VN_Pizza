import { SignIn } from '@clerk/clerk-react';
import AuthLayout from '../../layouts/AuthLayout';

const SignInPage = () => {
    return (
        <AuthLayout>
            <SignIn
                routing="path"
                path="/sign-in"
                appearance={{
                    elements: {
                        card: "bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 border-t-white/20",
                        headerTitle: "text-white text-2xl font-bold font-display",
                        headerSubtitle: "text-gray-400 font-sans",
                        formButtonPrimary: "bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-500/20",
                        formFieldInput: "bg-white/5 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all placeholder-gray-500",
                        formFieldLabel: "text-gray-300 font-medium",
                        footerActionLink: "text-brand-gold hover:text-brand-gold/80 font-semibold",
                        dividerLine: "bg-gray-700",
                        dividerText: "text-gray-500",
                        socialButtonsBlockButton: "bg-white/5 border border-gray-600/50 hover:bg-white/10 text-white rounded-xl",
                        socialButtonsBlockButtonText: "text-gray-200 font-medium"
                    }
                }}
            />
        </AuthLayout>
    );
};

export default SignInPage;
