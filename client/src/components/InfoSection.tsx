import { Card, CardContent } from "@/components/ui/card";

export default function InfoSection() {
  return (
    <Card className="mt-8 bg-white shadow-sm border border-[#E5E5E5]">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">About Smart Wallet Sub Accounts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#EBF0FF] flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-medium">Sub Accounts</h3>
            </div>
            <p className="text-sm text-[#444444]">Sub Accounts allow Smart Wallet users to create multiple accounts with different spend limits, improving security and flexibility.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#EBF0FF] flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-medium">Spend Limits</h3>
            </div>
            <p className="text-sm text-[#444444]">Set daily spending caps for each Sub Account to control how much can be spent without additional authentication.</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#EBF0FF] flex items-center justify-center text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-medium">Subscriptions</h3>
            </div>
            <p className="text-sm text-[#444444]">Enable recurring payments without repeated authentication, perfect for subscription-based services.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
