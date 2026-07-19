"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

export function PaymentQR({ url, label }: { url: string; label?: string }) {
  return (
    <Card className="border-echo-cyan/20">
      <CardContent className="flex flex-col items-center gap-3 p-5">
        <div className="rounded-xl bg-white p-3 shadow-glow-sm">
          <QRCodeSVG
            value={url}
            size={148}
            level="M"
            bgColor="#ffffff"
            fgColor="#020617"
            includeMargin={false}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {label ?? "Scan to open payment page"}
        </p>
      </CardContent>
    </Card>
  );
}
