import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Percent, Tag } from "lucide-react";

const DiscountCalculator = () => {
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [fixedDiscount, setFixedDiscount] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(0);

  const price = Math.max(0, parseFloat(originalPrice) || 0);
  const rawDiscount = discountType === "percentage"
    ? price * (discountPercent / 100)
    : parseFloat(fixedDiscount) || 0;
  const discount = Math.min(price, Math.max(0, rawDiscount));
  const priceAfterDiscount = price - discount;
  const taxAmount = priceAfterDiscount * (taxRate / 100);
  const finalPrice = priceAfterDiscount + taxAmount;
  const savings = price - priceAfterDiscount;

  const quickDiscounts = [10, 15, 20, 25, 30, 50];

  return (
    <ToolLayout
      title="Discount Calculator"
      description="Calculate discounts, sale prices, and savings instantly. Perfect for shopping, sales, and price comparisons. Free discount and savings calculator."
      category="Calculators"
      instructions={[
        "Enter the original price",
        "Choose discount type (percentage or fixed amount)",
        "Select or enter discount value",
        "Optionally add tax rate",
        "View final price, savings, and breakdown"
      ]}
      relatedTools={[
        { name: "Tip Calculator", path: "/tools/tip-calculator" },
        { name: "Tip Calculator", path: "/tools/tip-calculator" },
        { name: "Percentage Calculator", path: "/tools/percentage-calculator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Original Price */}
            <div>
              <Label htmlFor="original-price">Original Price</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="original-price"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Input */}
            {discountType === "percentage" ? (
              <>
                {/* Quick Discount Buttons */}
                <div>
                  <Label>Quick Discount Selection</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {quickDiscounts.map((discount) => (
                      <Button
                        key={discount}
                        variant={discountPercent === discount ? "default" : "outline"}
                        onClick={() => setDiscountPercent(discount)}
                        className="w-full"
                        size="sm"
                      >
                        {discount}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Discount Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Discount Percentage: {discountPercent}%</Label>
                  </div>
                  <Slider
                    value={[discountPercent]}
                    onValueChange={(value) => setDiscountPercent(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="fixed-discount">Fixed Discount Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fixed-discount"
                    type="number"
                    value={fixedDiscount}
                    onChange={(e) => setFixedDiscount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Tax Rate (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Sales Tax (Optional): {taxRate}%</Label>
              </div>
              <Slider
                value={[taxRate]}
                onValueChange={(value) => setTaxRate(value[0])}
                min={0}
                max={20}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {price > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Original Price</span>
                  <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div>
                    <span className="text-sm font-medium block">Discount</span>
                    <span className="text-xs text-muted-foreground">
                      {discountType === "percentage" ? `${discountPercent}% off` : "Fixed amount"}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">-${discount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Price After Discount</span>
                  <span className="text-xl font-semibold">${priceAfterDiscount.toFixed(2)}</span>
                </div>

                {taxRate > 0 && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-xs font-medium">Tax ({taxRate}%)</span>
                      <span className="text-lg font-semibold">+${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-sm font-medium">Final Price (with tax)</span>
                      <span className="text-2xl font-bold text-green-600">${finalPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {taxRate === 0 && (
                  <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-sm font-medium">Final Price</span>
                    <span className="text-2xl font-bold text-green-600">${finalPrice.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div>
                    <span className="text-sm font-medium block">Total Savings</span>
                    <span className="text-xs text-blue-600">
                      You save {((savings / price) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">${savings.toFixed(2)}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-semibold text-sm mb-2">Price Breakdown</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>- Original Price: ${price.toFixed(2)}</p>
                  <p>- Discount: -${discount.toFixed(2)} {discountType === "percentage" && `(${discountPercent}%)`}</p>
                  {taxRate > 0 && <p>- Tax: +${taxAmount.toFixed(2)} ({taxRate}%)</p>}
                  <p className="font-semibold text-foreground pt-1">- Final Price: ${finalPrice.toFixed(2)}</p>
                  <p className="text-blue-600">- You Save: ${savings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Discounts */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Common Sale Discounts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">10% OFF</p>
                <p className="text-xs text-muted-foreground">Small sales</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">20% OFF</p>
                <p className="text-xs text-muted-foreground">Regular sales</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">30% OFF</p>
                <p className="text-xs text-muted-foreground">Good deals</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">50% OFF</p>
                <p className="text-xs text-muted-foreground">Half price</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">70% OFF</p>
                <p className="text-xs text-muted-foreground">Clearance</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <Tag className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="font-medium">BOGO</p>
                <p className="text-xs text-muted-foreground">Buy 1 Get 1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DiscountCalculator;
