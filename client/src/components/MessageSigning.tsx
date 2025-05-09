import { useState } from "react";
import { useSignMessage } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PenLine } from "lucide-react";

export default function MessageSigning() {
  const [message, setMessage] = useState("Hello World");
  const { signMessage, data: signData, isPending, error } = useSignMessage();

  const handleSignMessage = () => {
    signMessage({ message });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sign Message</h2>
        <p className="text-textSecondary mb-4">
          Sign a message with your Sub Account to verify your identity.
        </p>
        
        <div className="mb-4">
          <Label htmlFor="message" className="block text-sm font-medium text-textSecondary mb-1">
            Message
          </Label>
          <Input 
            id="message" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <Button 
          onClick={handleSignMessage} 
          disabled={isPending || !message.trim()}
          variant="outline"
          className="mb-4 bg-white border border-primary text-primary hover:bg-primary/5 font-medium"
        >
          <PenLine className="h-5 w-5 mr-2" />
          Sign Message
        </Button>
        
        {error && (
          <div className="text-sm text-destructive mt-2 mb-4">
            Error: {error.message}
          </div>
        )}
        
        {signData && (
          <div>
            <div className="text-sm font-medium text-textSecondary mb-1">Signed Message</div>
            <div className="p-3 bg-gray-50 rounded-lg break-all text-sm">
              {signData}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
