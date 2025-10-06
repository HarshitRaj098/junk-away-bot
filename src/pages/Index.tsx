import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClassificationResult {
  classification: "spam" | "not_spam";
  confidence: number;
  reason: string;
}

const Index = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const classifyMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message to classify");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("classify-spam", {
        body: { message },
      });

      if (error) {
        console.error("Classification error:", error);
        toast.error("Failed to classify message. Please try again.");
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      classifyMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Mail className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Spam Classifier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered spam detection. Paste any message or email to instantly check if it's spam.
          </p>
        </div>

        {/* Input Card */}
        <Card className="p-6 md:p-8 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Message to Analyze
              </label>
              <Textarea
                placeholder="Paste your email or message here... &#10;&#10;Try something like: 'URGENT! You've won $1,000,000! Click here to claim your prize now!'"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[160px] resize-none text-base"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to classify
              </p>
            </div>
            <Button
              onClick={classifyMessage}
              disabled={loading || !message.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-md"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Classify Message"
              )}
            </Button>
          </div>
        </Card>

        {/* Result Card */}
        {result && (
          <Card
            className={`p-6 md:p-8 animate-scale-in ${
              result.classification === "spam"
                ? "border-destructive/50 shadow-danger"
                : "border-success/50 shadow-success"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    result.classification === "spam"
                      ? "bg-destructive/10"
                      : "bg-success/10"
                  }`}
                >
                  {result.classification === "spam" ? (
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  ) : (
                    <Shield className="w-8 h-8 text-success" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-2xl font-bold ${
                        result.classification === "spam"
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {result.classification === "spam"
                        ? "⚠️ Spam Detected"
                        : "✓ Safe Message"}
                    </h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                      {Math.round(result.confidence * 100)}% confident
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {result.reason}
                  </p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Confidence Level</span>
                  <span>{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.classification === "spam"
                        ? "bg-gradient-danger"
                        : "bg-gradient-success"
                    }`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
