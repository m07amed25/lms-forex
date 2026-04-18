"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createPaymentIntention } from "../_actions/create-payment";
import { toast } from "sonner";

export default function CheckoutForm({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePayment = () => {
    startTransition(async () => {
      const result = await createPaymentIntention(courseId);
      if (result.status === "success") {
        window.location.href = result.redirectUrl;
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      size="lg"
      onClick={handlePayment}
      disabled={isPending}
      className="w-full text-base"
    >
      {isPending ? "Processing..." : "Proceed to Payment"}
    </Button>
  );
}

