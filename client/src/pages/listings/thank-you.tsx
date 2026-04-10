import Logo from "@/components/logo";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ThankYouPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen w-full">
            <header className='w-full bg-white dark:bg-black/80 shadow-sm h-14 mb-2'>
                <div className='w-full max-w-7xl mx-auto p-2.5'>
                    <Logo />
                </div>
            </header>
            <div className="flex-1 max-w-6xl mx-auto flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md px-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. We'll send a confirmation to your email shortly.
                    </p>
                    {orderId && (
                        <p className="text-xs text-muted-foreground">
                            Order ID: <span className="font-mono">{orderId}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThankYouPage;
